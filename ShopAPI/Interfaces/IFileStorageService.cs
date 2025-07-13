using ShopAPI.Enums;

namespace ShopAPI.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, ImageType type, int? userId);
}

