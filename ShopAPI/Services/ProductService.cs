using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos.Product;
using ShopAPI.Enums;
using ShopAPI.Helpers;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using ShopAPI.Requests;
using static ShopAPI.Services.FileStorageService;

namespace ShopAPI.Services;

public class ProductService : IProductService
{
    private readonly ShopContext _context;

    private readonly IFileStorageService _fileStorage;

    public ProductService(ShopContext context, IFileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }
    public async Task<IEnumerable<ReadProductDto>> GetProductsAsync(ProductQueryParameters query)
    {
        var productsQuery = _context.Products
            .Include(p => p.Images)
            .AsQueryable();

        if (query.Category.HasValue)
        {
            var categoryIds = await _context.Categories
                .Where(c => c.Id == query.Category.Value || c.ParentId == query.Category.Value)
                .Select(c => c.Id)
                .ToListAsync();
            productsQuery = productsQuery.Where(p => categoryIds.Contains(p.CategoryId));
        }
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchLower = query.Search.ToLower();
            productsQuery = productsQuery.Where(p =>
                p.Name.ToLower().Contains(searchLower) ||
                (p.Description != null && p.Description.ToLower().Contains(searchLower))
            );
        }

        if (query.MinPrice.HasValue)
            productsQuery = productsQuery.Where(p => p.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            productsQuery = productsQuery.Where(p => p.Price <= query.MaxPrice.Value);

        // Sorting
        if (!string.IsNullOrWhiteSpace(query.SortBy))
        {
            var sortBy = query.SortBy.ToLowerInvariant();
            productsQuery = query.SortOrder == SortOrder.Desc
                ? sortBy switch
                {
                    "price" => productsQuery.OrderByDescending(p => p.Price),
                    "id" => productsQuery.OrderByDescending(p => p.Id),
                    _ => productsQuery.OrderByDescending(p => p.Name)
                }
                : sortBy switch
                {
                    "price" => productsQuery.OrderBy(p => p.Price),
                    "id" => productsQuery.OrderBy(p => p.Id),
                    _ => productsQuery.OrderBy(p => p.Name)
                };
        }

        return await productsQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new ReadProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                CategoryId = p.CategoryId,
                Slug = p.Slug,
                Images = p.Images
                    .OrderBy(img => img.Position)
                    .Select(img => new ProductImageDto
                    {
                        Id = img.Id,
                        Url = img.Url,
                        ThumbnailUrl = img.ThumbnailUrl,
                        Position = img.Position
                    }).ToList()
            })
            .ToListAsync();
    }

    public async Task<ReadProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return null;

        return new ReadProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            CategoryId = product.CategoryId,
            Slug = product.Slug,
            Images = product.Images
                .OrderBy(img => img.Position)
                .Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    Url = img.Url,
                    ThumbnailUrl = img.ThumbnailUrl,
                    Position = img.Position
                }).ToList()
        };
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


    public async Task<ReadProductDto?> CreateProductAsync(WriteProductDto dto, int? userId)
    {
        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            return null;

        var imageResults = new List<ImageSaveResult>();
        if (dto.Images != null)
        {
            foreach (var file in dto.Images)
            {
                var result = await _fileStorage.SaveImageAsync(file, ImageType.Product, userId);
                imageResults.Add(result);
            }
        }

        var images = imageResults.Select((res, index) => new ProductImage
        {
            Url = res.Url,
            ThumbnailUrl = res.ThumbnailUrl,
            Position = index + 1 // Start positions from 1
        }).ToList();

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

        // Generate slug after ID is available
        product.Slug = SlugHelper.GenerateSlug(product.Name, product.Id);
        await _context.SaveChangesAsync();

        return new ReadProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            CategoryId = product.CategoryId,
            Slug = product.Slug,
            Images = product.Images
                .OrderBy(img => img.Position)
                .Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    Url = img.Url,
                    ThumbnailUrl = img.ThumbnailUrl,
                    Position = img.Position
                }).ToList()
        };
    }

    public async Task<bool> UpdateProductAsync(int id, UpdateProductDto dto, int? userId)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return false;

        // Update basic fields
        if (!string.IsNullOrEmpty(dto.Name))
        {
            product.Name = dto.Name;
            product.Slug = SlugHelper.GenerateSlug(dto.Name, id);
        }

        if (!string.IsNullOrEmpty(dto.Description))
            product.Description = dto.Description;

        if (dto.Price.HasValue)
            product.Price = dto.Price.Value;

        if (dto.CategoryId.HasValue)
        {
            var category = await _context.Categories.FindAsync(dto.CategoryId.Value);
            if (category == null)
                return false;
            
            product.CategoryId = dto.CategoryId.Value;
            product.Category = category;
        }

        // Handle image deletions
        if (dto.ImagesToDelete != null && dto.ImagesToDelete.Any())
        {
            var imagesToRemove = product.Images
                .Where(img => dto.ImagesToDelete.Contains(img.Id))
                .ToList();

            foreach (var imageToRemove in imagesToRemove)
            {
                product.Images.Remove(imageToRemove);
            }
        }

        // Handle new images
        if (dto.NewImages != null && dto.NewImages.Any())
        {
            // Get the highest existing position
            var maxPosition = product.Images.Any() ? product.Images.Max(img => img.Position) : 0;

            foreach (var file in dto.NewImages)
            {
                var result = await _fileStorage.SaveImageAsync(file, ImageType.Product, userId);
                product.Images.Add(new ProductImage
                {
                    Url = result.Url,
                    ThumbnailUrl = result.ThumbnailUrl,
                    Position = ++maxPosition // Increment position for each new image
                });
            }
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

