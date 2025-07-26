using ShopAPI.Enums;

namespace ShopAPI.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveImageAsync(IFormFile file, ImageType type, int? userId);
}

