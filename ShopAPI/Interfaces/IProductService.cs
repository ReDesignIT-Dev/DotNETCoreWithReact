using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Product;
using ShopAPI.Requests;

namespace ShopAPI.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ReadProductDto>> GetProductsAsync(ProductQueryParameters query);
    Task<int> GetProductsCountAsync(int? categoryId, string? search);
    Task<ReadProductDto?> CreateProductAsync(WriteProductDto dto, List<string>? images);
    Task<bool> UpdateProductAsync(int id, WriteProductDto dto, List<string>? images);
    Task<bool> DeleteProductAsync(int id);
}
