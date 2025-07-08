namespace ShopAPI.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file);
}

