using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<ProductService> _logger;
    private readonly ICategoryService _categoryService;

    public ProductService(ShopContext context, IFileStorageService fileStorage, ILogger<ProductService> logger, ICategoryService categoryService)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
        _categoryService = categoryService;
    }

    public async Task<IEnumerable<ReadProductDto>> GetProductsAsync(ProductQueryParameters query)
    {
        var productsQuery = _context.Products
            .Include(p => p.Images)
            .AsQueryable();

        if (query.Category.HasValue)
        {
            var categoryIds = await _categoryService.GetAllDescendantCategoryIdsAsync(query.Category.Value);
            productsQuery = productsQuery.Where(p => categoryIds.Contains(p.CategoryId));
        }
        
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchLower = query.Search.ToLower().Trim();
            _logger.LogInformation("Searching for: '{SearchTerm}'", searchLower);
            
            productsQuery = productsQuery.Where(p =>
                p.Name.ToLower().Contains(searchLower) ||
                (p.Description != null && p.Description.ToLower().Contains(searchLower))
            );
            
            // Debug: Log what products match the search
            var matchingProducts = await productsQuery
                .Select(p => new { p.Id, p.Name, p.Description })
                .ToListAsync();
                
            foreach (var product in matchingProducts)
            {
                _logger.LogInformation("Found product: ID={ProductId}, Name='{ProductName}', Description='{ProductDescription}'", 
                    product.Id, product.Name, product.Description);
            }
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
            var categoryIds = await _categoryService.GetAllDescendantCategoryIdsAsync(categoryId.Value);
            query = query.Where(p => categoryIds.Contains(p.CategoryId));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower().Trim(); // Make consistent with GetProductsAsync
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchLower) ||
                (p.Description != null && p.Description.ToLower().Contains(searchLower))
            );
        }

        return await query.CountAsync();
    }

    public async Task<ReadProductDto?> CreateProductAsync(WriteProductDto dto, int? userId)
    {
        try
        {
            // Validate category exists
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
            {
                _logger.LogWarning("CreateProductAsync failed: Category {CategoryId} not found", dto.CategoryId);
                return null;
            }

            _logger.LogInformation("Category found: {CategoryName} (ID: {CategoryId})", category.Name, category.Id);

            // Process images
            var imageResults = new List<ImageSaveResult>();
            if (dto.Images != null && dto.Images.Any())
            {
                _logger.LogInformation("Processing {ImageCount} images", dto.Images.Count);

                for (int i = 0; i < dto.Images.Count; i++)
                {
                    var file = dto.Images[i];
                    try
                    {
                        _logger.LogInformation("Processing image {Index}: {FileName} ({Size} bytes)",
                            i + 1, file.FileName, file.Length);

                        var result = await _fileStorage.SaveImageAsync(file, ImageType.Product, userId);
                        imageResults.Add(result);

                        _logger.LogInformation("Image {Index} saved successfully. Url: {Url}, ThumbnailUrl: {ThumbnailUrl}",
                            i + 1, result.Url, result.ThumbnailUrl);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to save image {Index} ({FileName})", i + 1, file.FileName);
                        throw; // Re-throw to be caught by outer try-catch
                    }
                }
            }
            else
            {
                _logger.LogInformation("No images provided for product creation");
            }

            // Create product images
            var images = imageResults.Select((res, index) => new ProductImage
            {
                Url = res.Url,
                ThumbnailUrl = res.ThumbnailUrl,
                Position = index + 1
            }).ToList();

            _logger.LogInformation("Created {ImageCount} ProductImage entities with positions 1 to {MaxPosition}",
                images.Count, images.Count);

            // Create product
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description ?? string.Empty,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                Category = category,
                Images = images
            };

            _logger.LogInformation("Adding product to context: {ProductName}", product.Name);

            _context.Products.Add(product);

            _logger.LogInformation("Saving product to database...");
            await _context.SaveChangesAsync();

            _logger.LogInformation("Product saved with ID: {ProductId}. Generating slug...", product.Id);

            // Generate slug after ID is available
            product.Slug = SlugHelper.GenerateSlug(product.Name, product.Id);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Product creation completed successfully. ID: {ProductId}, Slug: {Slug}",
                product.Id, product.Slug);

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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CreateProductAsync for product {ProductName} (CategoryId: {CategoryId})",
                dto.Name, dto.CategoryId);
            throw; // Re-throw to be handled by controller
        }
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

        // Handle image reorganization
        await ReorganizeImages(product, dto.CurrentImages, dto.NewImages, userId);

        await _context.SaveChangesAsync();
        return true;
    }

    private async Task ReorganizeImages(
        Product product,
        Dictionary<int, int>? currentImages,
        List<IFormFile>? newImages,
        int? userId)
    {
        // If no image changes specified, skip
        if (currentImages == null && (newImages == null || !newImages.Any()))
            return;

        // Handle deletions: remove images not in currentImages
        if (currentImages != null)
        {
            var imagesToDelete = product.Images
                .Where(img => !currentImages.ContainsKey(img.Id))
                .ToList();

            foreach (var imageToDelete in imagesToDelete)
            {
                product.Images.Remove(imageToDelete);
            }
        }

        // Update positions of existing images
        if (currentImages != null)
        {
            foreach (var (imageId, position) in currentImages)
            {
                var existingImage = product.Images.FirstOrDefault(img => img.Id == imageId);
                if (existingImage != null)
                {
                    existingImage.Position = position;
                }
            }
        }

        // Handle new images: find gaps and fill them
        if (newImages != null && newImages.Any())
        {
            // Get all occupied positions
            var occupiedPositions = product.Images.Select(img => img.Position).ToHashSet();

            // Find gaps and available positions
            var availablePositions = new List<int>();
            var maxPosition = occupiedPositions.Any() ? occupiedPositions.Max() : 0;

            // Find gaps in existing positions (1, 2, 3, ... maxPosition)
            for (int i = 1; i <= maxPosition; i++)
            {
                if (!occupiedPositions.Contains(i))
                {
                    availablePositions.Add(i);
                }
            }

            // Add positions after the max position if needed
            while (availablePositions.Count < newImages.Count)
            {
                availablePositions.Add(++maxPosition);
            }

            // Process new images
            for (int i = 0; i < newImages.Count; i++)
            {
                var file = newImages[i];
                var result = await _fileStorage.SaveImageAsync(file, ImageType.Product, userId);

                var newImage = new ProductImage
                {
                    Url = result.Url,
                    ThumbnailUrl = result.ThumbnailUrl,
                    Position = availablePositions[i], // Fill gaps in order
                    ProductId = product.Id
                };

                product.Images.Add(newImage);
            }
        }
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

