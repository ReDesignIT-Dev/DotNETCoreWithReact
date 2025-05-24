using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopAPI.Models;
using ShopAPI.Data;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ShopContext _context;
    public CategoriesController(ShopContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        var categories = await _context.Categories
            .Include(c => c.Children)
            .ToListAsync();
        return Ok(categories);
    }
}