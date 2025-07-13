using ShopAPI.Interfaces;
using System.Security.Cryptography;

namespace ShopAPI.Services;

public class FileStorageService : IFileStorageService
{
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public async Task<string> SaveFileAsync(IFormFile file)
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

        var fileName = $"{hash}{ext}";
        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        Directory.CreateDirectory(uploadDir);
        var filePath = Path.Combine(uploadDir, fileName);

        if (!File.Exists(filePath))
        {
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
        }
        return $"/uploads/{fileName}";
    }

}

