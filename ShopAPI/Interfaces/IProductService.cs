using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Product;

namespace ShopAPI.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ReadProductDto>> GetProductsAsync(int? categoryId, string? search, int page, int pageSize);
    Task<int> GetProductsCountAsync(int? categoryId, string? search);
    Task<ReadProductDto?> CreateProductAsync(WriteProductDto dto, List<string> images);
    Task<bool> UpdateProductAsync(int id, WriteProductDto dto, List<string> images);
    Task<bool> DeleteProductAsync(int id);
}
