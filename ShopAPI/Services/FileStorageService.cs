using ShopAPI.Enums;
using ShopAPI.Interfaces;
using System.Security.Cryptography;

namespace ShopAPI.Services;

public class FileStorageService : IFileStorageService
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public async Task<string> SaveFileAsync(IFormFile file, ImageType type, int? userId = null)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Unsupported file type.");

        if (file.Length > MaxFileSize)
            throw new InvalidOperationException("File size exceeds limit.");

        // Compute hash
        string hash;
        using (var sha256 = SHA256.Create())
        using (var stream = file.OpenReadStream())
        {
            var hashBytes = await sha256.ComputeHashAsync(stream);
            hash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }

        string uploadDir;
        switch (type)
        {
            case ImageType.Product:
                if (userId == null)
                    throw new ArgumentException("userId is required for product images.");
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "products", userId.ToString()!);
                break;
            case ImageType.Category:
                uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "categories");
                break;
            default:
                throw new ArgumentException("Invalid image type.");
        }

        Directory.CreateDirectory(uploadDir);
        var fileName = $"{hash}{ext}";
        var filePath = Path.Combine(uploadDir, fileName);

        if (!File.Exists(filePath))
        {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
        }

        var url = type == ImageType.Product
            ? $"/uploads/products/{userId}/{fileName}"
            : $"/uploads/categories/{fileName}";
        return url;
    }
}
