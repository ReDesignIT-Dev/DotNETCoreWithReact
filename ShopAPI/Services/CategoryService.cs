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
        var c = await _context.Categories
            .Include(c => c.Image)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        if (c == null) return null;
        
        return new ReadCategoryDto 
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            ShortName = c.ShortName,
            ParentId = c.ParentId,
            ProductCount = c.Products.Count,
            Image = c.Image != null
                ? new CategoryImageDto
                {
                    Id = c.Image.Id,
                    Url = c.Image.Url,
                    ThumbnailUrl = c.Image.ThumbnailUrl
                }
                : null
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

    public async Task<List<int>> GetAllDescendantCategoryIdsAsync(int categoryId)
    {
        var categoryIds = new List<int> { categoryId }; // Include the parent category itself
        var categoriesToProcess = new Queue<int>();
        categoriesToProcess.Enqueue(categoryId);

        while (categoriesToProcess.Count > 0)
        {
            var currentCategoryId = categoriesToProcess.Dequeue();
            
            var childCategoryIds = await _context.Categories
                .Where(c => c.ParentId == currentCategoryId)
                .Select(c => c.Id)
                .ToListAsync();

            foreach (var childId in childCategoryIds)
            {
                categoryIds.Add(childId);
                categoriesToProcess.Enqueue(childId); // Add to queue to process its children
            }
        }

        return categoryIds;
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
        var category = await _context.Categories
            .Include(c => c.Image)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        if (category == null)
            return false;

        // Update basic fields
        category.Name = dto.Name;
        category.ShortName = dto.ShortName;
        category.ParentId = dto.ParentId;
        category.Slug = SlugHelper.GenerateSlug(dto.Name, id);

        // Handle image removal
        if (dto.RemoveImage && category.Image != null)
        {
            // Delete old image files from storage
            await _fileStorage.DeleteImageAsync(category.Image.Url);
            await _fileStorage.DeleteImageAsync(category.Image.ThumbnailUrl);
            
            // Remove the old image entity
            _context.Remove(category.Image);
            category.Image = null;
        }
        // Handle image replacement/addition
        else if (dto.Image != null)
        {
            // If there's an existing image, remove it first
            if (category.Image != null)
            {
                // Delete old image files from storage
                await _fileStorage.DeleteImageAsync(category.Image.Url);
                await _fileStorage.DeleteImageAsync(category.Image.ThumbnailUrl);
                
                // Remove the old image entity
                _context.Remove(category.Image);
            }

            // Save the new image
            var imageResult = await _fileStorage.SaveImageAsync(dto.Image, ImageType.Category, null);
            category.Image = new CategoryImage 
            { 
                Url = imageResult.Url, 
                ThumbnailUrl = imageResult.ThumbnailUrl 
            };
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Image)
            .FirstOrDefaultAsync(c => c.Id == id);
        
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

        // Delete category image if exists
        if (category.Image != null)
        {
            await _fileStorage.DeleteImageAsync(category.Image.Url);
            await _fileStorage.DeleteImageAsync(category.Image.ThumbnailUrl);
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetCategoriesCountAsync()
    {
        return await _context.Categories.CountAsync();
    }

    public async Task<List<CategoryTreeDto>> GetSearchAssociatedCategoriesAsync(string searchTerm)
    {
        var searchTermLower = searchTerm.ToLower();
        
        // Get all matching products with their categories
        var matchingProducts = await _context.Products
            .Where(p => p.Name.ToLower().Contains(searchTermLower) ||
                       (p.Description != null && p.Description.ToLower().Contains(searchTermLower)))
            .Select(p => p.CategoryId)
            .ToListAsync();

        if (!matchingProducts.Any())
            return new List<CategoryTreeDto>();

        // Count products per category
        var productCountsByCategory = matchingProducts
            .GroupBy(categoryId => categoryId)
            .ToDictionary(g => g.Key, g => g.Count());

        // Get all categories
        var allCategories = await _context.Categories
            .Select(c => new { c.Id, c.Name, c.Slug, c.ShortName, c.ParentId })
            .ToDictionaryAsync(c => c.Id);

        // Build descendant mappings for efficiency
        var descendantMappings = new Dictionary<int, List<int>>();
        foreach (var categoryId in allCategories.Keys)
        {
            descendantMappings[categoryId] = await GetAllDescendantCategoryIdsAsync(categoryId);
        }

        // Calculate product counts including descendants
        var categoryProductCounts = new Dictionary<int, int>();
        foreach (var category in allCategories.Values)
        {
            var descendants = descendantMappings[category.Id];
            var totalCount = descendants
                .Where(id => productCountsByCategory.ContainsKey(id))
                .Sum(id => productCountsByCategory[id]);
            
            categoryProductCounts[category.Id] = totalCount;
        }

        // Find relevant categories (those with products or ancestors of categories with products)
        var relevantCategoryIds = new HashSet<int>();
        var categoriesWithProducts = productCountsByCategory.Keys;
        
        foreach (var categoryId in categoriesWithProducts)
        {
            var current = allCategories.GetValueOrDefault(categoryId);
            while (current != null)
            {
                relevantCategoryIds.Add(current.Id);
                current = current.ParentId.HasValue 
                    ? allCategories.GetValueOrDefault(current.ParentId.Value) 
                    : null;
            }
        }

        // Build result
        var relevantCategories = relevantCategoryIds
            .Where(id => categoryProductCounts[id] > 0) // Only include categories with products
            .Select(id =>
            {
                var cat = allCategories[id];
                return new ReadCategoryDto
                {
                    Id = cat.Id,
                    Name = cat.Name,
                    Slug = cat.Slug,
                    ShortName = cat.ShortName,
                    ParentId = cat.ParentId,
                    ProductCount = categoryProductCounts[id]
                };
            })
            .ToList();

        return BuildCategoryTree(relevantCategories);
    }

    public async Task<List<CategoryTreeDto>> GetCategoryChildrenWithSearchAsync(int categoryId, string? searchTerm = null)
    {
        var category = await _context.Categories.FindAsync(categoryId);
        if (category == null) return new List<CategoryTreeDto>();

        List<ReadCategoryDto> childCategories;

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var searchTermLower = searchTerm.ToLower();
            
            // Get children categories
            var children = await _context.Categories
                .Where(c => c.ParentId == categoryId)
                .Select(c => new { c.Id, c.Name, c.Slug, c.ShortName, c.ParentId })
                .ToListAsync();

            childCategories = new List<ReadCategoryDto>();
            
            // Calculate search-filtered product counts for each child (including descendants)
            foreach (var child in children)
            {
                var productCount = await GetDescendantProductCountAsync(child.Id, searchTermLower);
                
                // Only include categories that have matching products in them or their descendants
                if (productCount > 0)
                {
                    childCategories.Add(new ReadCategoryDto
                    {
                        Id = child.Id,
                        Name = child.Name,
                        Slug = child.Slug,
                        ShortName = child.ShortName,
                        ParentId = child.ParentId,
                        ProductCount = productCount
                    });
                }
            }
        }
        else
        {
            // No search, get normal counts (also recursive for consistency)
            var children = await _context.Categories
                .Where(c => c.ParentId == categoryId)
                .Select(c => new { c.Id, c.Name, c.Slug, c.ShortName, c.ParentId })
                .ToListAsync();

            childCategories = new List<ReadCategoryDto>();
            
            foreach (var child in children)
            {
                var descendantCategoryIds = await GetAllDescendantCategoryIdsAsync(child.Id);
                var productCount = await _context.Products
                    .Where(p => descendantCategoryIds.Contains(p.CategoryId))
                    .CountAsync();

                childCategories.Add(new ReadCategoryDto
                {
                    Id = child.Id,
                    Name = child.Name,
                    Slug = child.Slug,
                    ShortName = child.ShortName,
                    ParentId = child.ParentId,
                    ProductCount = productCount
                });
            }
        }

        return BuildCategoryTree(childCategories);
    }

    private async Task<int> GetDescendantProductCountAsync(int categoryId, string searchTermLower)
    {
        // Get all descendant category IDs (including the category itself)
        var descendantCategoryIds = await GetAllDescendantCategoryIdsAsync(categoryId);
        
        // Count products matching the search in all descendant categories
        return await _context.Products
            .Where(p => descendantCategoryIds.Contains(p.CategoryId) &&
                       (p.Name.ToLower().Contains(searchTermLower) ||
                        (p.Description != null && p.Description.ToLower().Contains(searchTermLower))))
            .CountAsync();
    }
}
