using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos.Product;
using ShopAPI.Interfaces;
using ShopAPI.Models;

namespace ShopAPI.Services;

public class ProductService : IProductService
{
    private readonly ShopContext _context;
    public ProductService(ShopContext context) => _context = context;

    public async Task<IEnumerable<ReadProductDto>> GetProductsAsync(int? categoryId, string? search, int page, int pageSize)
    {
        var query = _context.Products
            .Include(p => p.Images)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            var categoryIds = await _context.Categories
                .Where(c => c.Id == categoryId.Value || c.ParentId == categoryId.Value)
                .Select(c => c.Id)
                .ToListAsync();
            query = query.Where(p => categoryIds.Contains(p.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p =>
                p.Name.Contains(search) ||
                (p.Description != null && p.Description.Contains(search))
            );
        }

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ReadProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                CategoryId = p.CategoryId,
                Images = p.Images.Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    Url = img.Url
                }).ToList()
            })
            .ToListAsync();
    }

    public async Task<int> GetProductsCountAsync(int? categoryId, string? search)
    {
        var query = _context.Products.AsQueryable();

        if (categoryId.HasValue)
        {
            var categoryIds = await _context.Categories
                .Where(c => c.Id == categoryId.Value || c.ParentId == categoryId.Value)
                .Select(c => c.Id)
                .ToListAsync();
            query = query.Where(p => categoryIds.Contains(p.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(p =>
                p.Name.Contains(search) ||
                (p.Description != null && p.Description.Contains(search))
            );
        }

        return await query.CountAsync();
    }

    public async Task<ReadProductDto?> CreateProductAsync(WriteProductDto dto, List<string> imageUrls)
    {
        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            return null;

        // Create ProductImage entities from URLs
        var images = imageUrls?.Select(url => new ProductImage { Url = url }).ToList() ?? new List<ProductImage>();

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            CategoryId = dto.CategoryId,
            Category = category,
            Images = images
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return new ReadProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            CategoryId = product.CategoryId,
            Images = product.Images.Select(img => new ProductImageDto
            {
                Id = img.Id,
                Url = img.Url
            }).ToList()
        };
    }


    public async Task<bool> UpdateProductAsync(int id, WriteProductDto dto, List<string> imageUrls)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return false;

        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            return false;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.CategoryId = dto.CategoryId;
        product.Category = category;

        // Replace all images with new ones
        product.Images.Clear();
        foreach (var url in imageUrls)
        {
            product.Images.Add(new ProductImage { Url = url });
        }

        await _context.SaveChangesAsync();
        return true;
    }


    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return true;
    }
}

