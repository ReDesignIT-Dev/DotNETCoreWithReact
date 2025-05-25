using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ShopContext _context;
    public ProductsController(ShopContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] int? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Products.AsQueryable();

        if (category.HasValue)
        {
            // Get all descendant category IDs (simple version, for demo)
            var categoryIds = await _context.Categories
                .Where(c => c.Id == category.Value || c.ParentId == category.Value)
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

        var total = await query.CountAsync();
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                CategoryId = p.CategoryId
            })
            .ToListAsync();

        return Ok(new
        {
            count = total,
            totalPages = (int)Math.Ceiling(total / (double)pageSize),
            products
        });
    }
}