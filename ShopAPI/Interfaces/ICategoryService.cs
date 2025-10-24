using ShopAPI.Dtos;
using ShopAPI.Dtos.Category;

namespace ShopAPI.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<ReadCategoryDto>> GetCategoriesAsync();
    Task<ReadCategoryDto?> GetCategoryByIdAsync(int id);
    Task<IEnumerable<ReadCategoryDto>> GetCategoriesByIdsAsync(IEnumerable<int> categoryIds);
    Task<ReadCategoryDto> CreateCategoryAsync(WriteCategoryDto dto);
    Task<bool> UpdateCategoryAsync(int id, WriteCategoryDto dto);
    Task<bool> DeleteCategoryAsync(int id);
    Task<List<CategoryTreeDto>> GetCategoryTreeAsync();
    Task<int> GetCategoriesCountAsync();
    Task<List<int>> GetAllDescendantCategoryIdsAsync(int categoryId);
}
