using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos;
using ShopAPI.Dtos.Category;
using ShopAPI.Interfaces;
using ShopAPI.Models;

namespace ShopAPI.Services;

public class CategoryService : ICategoryService
{
    private readonly ShopContext _context;
    public CategoryService(ShopContext context) => _context = context;

    public async Task<IEnumerable<ReadCategoryDto>> GetCategoriesAsync()
    {
        return await _context.Categories
            .Select(c => new ReadCategoryDto // Corrected from WriteCategoryDto to ReadCategoryDto  
            {
                Id = c.Id,
                Name = c.Name,
                ParentId = c.ParentId
            })
            .ToListAsync();
    }

    public async Task<ReadCategoryDto?> GetCategoryByIdAsync(int id)
    {
        var c = await _context.Categories.FindAsync(id);
        if (c == null) return null;
        return new ReadCategoryDto // Corrected from WriteCategoryDto to ReadCategoryDto  
        {
            Id = c.Id,
            Name = c.Name,
            ParentId = c.ParentId
        };
    }

    public async Task<ReadCategoryDto> CreateCategoryAsync(WriteCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            ParentId = dto.ParentId,
            ShortName = dto.ShortName
        };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new ReadCategoryDto // Corrected to return a ReadCategoryDto  
        {
            Id = category.Id,
            Name = category.Name,
            ParentId = category.ParentId,
            ShortName = category.ShortName
        };
    }

    public async Task<bool> UpdateCategoryAsync(int id, WriteCategoryDto dto)
    {

        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        category.Name = dto.Name;
        category.ParentId = dto.ParentId;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}
