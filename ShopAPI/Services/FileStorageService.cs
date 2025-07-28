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
        string url;
        switch (type)
        {
            case ImageType.Product:
                if (userId == null)
                    throw new ArgumentException("userId is required for product images.");
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "products", userId.ToString()!);
                url = $"/uploads/products/{userId}/{hash}{ext}";
                break;
            case ImageType.Category:
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "categories");
                url = $"/uploads/categories/{hash}{ext}";
                break;
            case ImageType.MyProject:
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "myprojects");
                url = $"/uploads/myprojects/{hash}{ext}";
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
        var thumbnailUrl = url.Replace($"{hash}{ext}", $"{hash}_thumb{ext}");

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

        return new ImageSaveResult(url, thumbnailUrl);
    }
}
