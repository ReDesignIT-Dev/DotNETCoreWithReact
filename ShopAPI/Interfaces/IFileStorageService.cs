using ShopAPI.Enums;
using static ShopAPI.Services.FileStorageService;

namespace ShopAPI.Interfaces;

public interface IFileStorageService
{
    Task<ImageSaveResult> SaveImageAsync(IFormFile file, ImageType type, int? userId);
}

