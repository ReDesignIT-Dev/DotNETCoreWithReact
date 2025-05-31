using ShopAPI.Dtos.Product;

namespace ShopAPI.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ReadProductDto>> GetProductsAsync(int? categoryId, string? search, int page, int pageSize);
    Task<int> GetProductsCountAsync(int? categoryId, string? search);
    Task<ReadProductDto?> CreateProductAsync(ReadProductDto dto);
    Task<bool> UpdateProductAsync(int id, ReadProductDto dto);
    Task<bool> DeleteProductAsync(int id);
}
