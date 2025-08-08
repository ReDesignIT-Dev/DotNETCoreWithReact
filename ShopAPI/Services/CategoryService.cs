using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos.Category;
using ShopAPI.Enums;
using ShopAPI.Helpers;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using static ShopAPI.Services.FileStorageService;

namespace ShopAPI.Services;

public class CategoryService : ICategoryService
{
    private readonly ShopContext _context;
    private readonly IFileStorageService _fileStorage;

    public CategoryService(ShopContext context, IFileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    public async Task<IEnumerable<ReadCategoryDto>> GetCategoriesAsync()
    {
        return await _context.Categories
            .Select(c => new ReadCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                ShortName = c.ShortName,
                ParentId = c.ParentId,
                ProductCount = c.Products.Count
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
            ParentId = c.ParentId,
            ProductCount = c.Products.Count
        };
    }

    public async Task<IEnumerable<ReadCategoryDto>> GetCategoriesByIdsAsync(IEnumerable<int> categoryIds)
    {
        return await _context.Categories
            .Where(c => categoryIds.Contains(c.Id))
            .Select(c => new ReadCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                ShortName = c.ShortName,
                ParentId = c.ParentId,
            })
            .ToListAsync();
    }

    public async Task<List<CategoryTreeDto>> GetCategoryTreeAsync()
    {
        var categories = await GetCategoriesAsync();
        return BuildCategoryTree(categories.ToList());
    }

    private List<CategoryTreeDto> BuildCategoryTree(List<ReadCategoryDto> categories, int? parentId = null)
    {

        return categories
            .Where(c => c.ParentId == parentId)
            .Select(c => new CategoryTreeDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Image = c.Image,
                ParentId = c.ParentId,
                ShortName = c.ShortName,
                ProductCount = c.ProductCount,
                Children = BuildCategoryTree(categories, c.Id)
            })
            .ToList();
    }

    public async Task<ReadCategoryDto> CreateCategoryAsync(WriteCategoryDto dto)
    {
        ImageSaveResult? imageResult = null;
        if (dto.Image != null)
            imageResult = await _fileStorage.SaveImageAsync(dto.Image, ImageType.Category, null);
        var category = new Category
        {
            Name = dto.Name,
            ShortName = dto.ShortName,
            ParentId = null,
            Image = imageResult != null
                ? new CategoryImage { Url = imageResult.Url, ThumbnailUrl = imageResult.ThumbnailUrl }
                : null
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
            ShortName = category.ShortName,
            Image = category.Image != null
                ? new CategoryImageDto
                {
                    Id = category.Image.Id,
                    Url = category.Image.Url,
                    ThumbnailUrl = category.Image.ThumbnailUrl
                }
                : null,
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
