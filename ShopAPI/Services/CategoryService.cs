using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos;
using ShopAPI.Dtos.Category;
using ShopAPI.Helpers;
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
            .Select(c => new ReadCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                ShortName = c.ShortName,
                ParentId = c.ParentId
            })
            .ToListAsync();
    }

    public async Task<ReadCategoryDto?> GetCategoryByIdAsync(int id)
    {
        var c = await _context.Categories.FindAsync(id);
        if (c == null) return null;
        return new ReadCategoryDto 
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            ShortName = c.ShortName,
            ParentId = c.ParentId
        };
    }
  public async Task<ReadCategoryDto> CreateCategoryAsync(WriteCategoryDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            ShortName = dto.ShortName,
            ParentId = null 
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        int? validParentId = null;
        if (dto.ParentId.HasValue)
        {
            if (dto.ParentId.Value != category.Id &&
                await _context.Categories.AnyAsync(c => c.Id == dto.ParentId.Value))
            {
                validParentId = dto.ParentId.Value;
            }
        }

        if (validParentId != null)
        {
            category.ParentId = validParentId;
            await _context.SaveChangesAsync();
        }

        category.Slug = SlugHelper.GenerateSlug(category.Name, category.Id);
        await _context.SaveChangesAsync();

        return new ReadCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
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
        category.Slug = SlugHelper.GenerateSlug(dto.Name, id);

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return false;

        // Get or create the default category
        var defaultCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Name == "Uncategorized");
        if (defaultCategory == null)
        {
            defaultCategory = new Category { Name = "Uncategorized", ShortName = "uncat" };
            _context.Categories.Add(defaultCategory);
            await _context.SaveChangesAsync();
        }

        // Reparent children
        var children = await _context.Categories.Where(c => c.ParentId == id).ToListAsync();
        foreach (var child in children)
        {
            child.ParentId = category.ParentId;
        }

        // Reassign products to default category
        var products = await _context.Products.Where(p => p.CategoryId == id).ToListAsync();
        foreach (var product in products)
        {
            product.CategoryId = defaultCategory.Id;
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}
