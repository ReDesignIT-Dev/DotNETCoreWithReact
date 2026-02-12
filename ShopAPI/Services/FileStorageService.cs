using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Gif;
using ShopAPI.Enums;
using ShopAPI.Interfaces;
using System.Security.Cryptography;

namespace ShopAPI.Services;

public class FileStorageService : IFileStorageService
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB
    private const int ThumbnailMaxSize = 250;
    private readonly ILogger<ProductService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;

    public FileStorageService(IHttpContextAccessor httpContextAccessor, IConfiguration configuration, ILogger<ProductService> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
        _logger = logger;
    }

    public record ImageSaveResult(string Url, string ThumbnailUrl);

    public async Task<ImageSaveResult> SaveImageAsync(IFormFile image, ImageType type, int? userId = null)
    {
        var ext = Path.GetExtension(image.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Unsupported file type.");

        if (image.Length > MaxFileSize)
            throw new InvalidOperationException("File size exceeds limit.");

        // Compute hash
        string hash;
        using (var sha256 = SHA256.Create())
        using (var stream = image.OpenReadStream())
        {
            var hashBytes = await sha256.ComputeHashAsync(stream);
            hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }

        string uploadDir;
        string relativeUrl;
        switch (type)
        {
            case ImageType.Product:
                if (userId == null)
                    throw new ArgumentException("userId is required for product images.");
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "products", userId.ToString()!);
                relativeUrl = $"/uploads/products/{userId}/{hash}{ext}";
                break;
            case ImageType.Category:
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "categories");
                relativeUrl = $"/uploads/categories/{hash}{ext}";
                break;
            case ImageType.MyProject:
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "myprojects");
                relativeUrl = $"/uploads/myprojects/{hash}{ext}";
                break;
            default:
                throw new ArgumentException("Invalid image type.");
        }

        Directory.CreateDirectory(uploadDir);
        var fileName = $"{hash}{ext}";
        var filePath = Path.Combine(uploadDir, fileName);

        // Save original image if not exists
        if (!File.Exists(filePath))
        {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }
        }

        // Save thumbnail
        var thumbFileName = $"{hash}_thumb{ext}";
        var thumbFilePath = Path.Combine(uploadDir, thumbFileName);
        var relativeThumbnailUrl = relativeUrl.Replace($"{hash}{ext}", $"{hash}_thumb{ext}");

        if (!File.Exists(thumbFilePath))
        {
            using (var thumbStream = image.OpenReadStream())
            using (var img = await Image.LoadAsync(thumbStream))
            {
                img.Mutate(x => x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(ThumbnailMaxSize, ThumbnailMaxSize)
                }));

                IImageEncoder encoder = ext switch
                {
                    ".jpg" or ".jpeg" => new JpegEncoder(),
                    ".png" => new PngEncoder(),
                    ".gif" => new GifEncoder(),
                    _ => throw new InvalidOperationException("Unsupported file type.")
                };

                await img.SaveAsync(thumbFilePath, encoder);
            }
        }

        // Convert relative URLs to absolute URLs
        var baseUrl = GetBaseUrl();
        var absoluteUrl = $"{baseUrl}{relativeUrl}";
        var absoluteThumbnailUrl = $"{baseUrl}{relativeThumbnailUrl}";

        return new ImageSaveResult(absoluteUrl, absoluteThumbnailUrl);
    }

    public async Task<bool> DeleteImageAsync(string imageUrl)
    {
        try
        {
            // Convert absolute URL to relative path
            var baseUrl = GetBaseUrl();
            var relativePath = imageUrl.Replace(baseUrl, "").TrimStart('/');
            
            // Convert URL path to file system path
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), relativePath.Replace('/', Path.DirectorySeparatorChar));
            
            // Delete the file if it exists
            if (File.Exists(filePath))
            {
                await Task.Run(() => File.Delete(filePath));
                return true;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image: {ImageUrl}", imageUrl);
            return false;
        }
    }

    private string GetBaseUrl()
    {
        // First try to get the configured backend base URL
        var configuredBaseUrl = _configuration["Backend:BaseUrl"];
        if (!string.IsNullOrEmpty(configuredBaseUrl))
        {
            return configuredBaseUrl.TrimEnd('/');
        }

        // Fallback to HTTP context
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            var request = httpContext.Request;
            var scheme = request.Scheme;
            var host = request.Host.Value;
            
            // Check for null or empty host
            if (string.IsNullOrEmpty(host))
            {
                return "https://localhost:7288"; // Fallback
            }
            
            // Handle specific port mappings for development
            if (host.Contains("localhost", StringComparison.OrdinalIgnoreCase) && !host.Contains(':'))
            {
                // If localhost without port, assume default ports
                host = scheme == "https" ? "localhost:7288" : "localhost:7288";
            }
            
            return $"{scheme}://{host}";
        }

        // Final fallback for development
        return "https://localhost:7288";
    }
}
