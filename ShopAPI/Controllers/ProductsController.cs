using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Product;
using ShopAPI.Interfaces;
using ShopAPI.Requests;
using ShopAPI.Enums;
using System.Security.Claims;
using ShopAPI.Services;
namespace ShopAPI.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminAndActive")]
[ApiController]
[Route("api/shop/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ProductListResponseDto>> GetProducts([FromQuery] ProductQueryParameters query)
    {
        var products = await _productService.GetProductsAsync(query);
        var total = await _productService.GetProductsCountAsync(query.Category, query.Search);

        var response = new ProductListResponseDto
        {
            Count = total,
            TotalPages = (int)Math.Ceiling(total / (double)query.PageSize),
            Products = products,
        };

        return Ok(response);
    }

    [AllowAnonymous]
    [HttpGet("count")]
    public async Task<ActionResult<int>> GetProductsCount([FromQuery] int? categoryId = null, [FromQuery] string? search = null)
    {
        var count = await _productService.GetProductsCountAsync(categoryId, search);
        return Ok(count);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<ReadProductDto>> GetProductById(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null)
            return NotFound();
        return Ok(product);
    }


    [HttpPost]
    public async Task<ActionResult<ReadProductDto>> CreateProduct([FromForm] WriteProductDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest("Product name is required.");
            }

            if (dto.Price <= 0)
            {
                return BadRequest("Product price must be greater than 0.");
            }

            if (dto.CategoryId <= 0)
            {
                return BadRequest("Valid category ID is required.");
            }

            var userId = GetUserId();

            var created = await _productService.CreateProductAsync(dto, userId);

            if (created == null)
            {
                return BadRequest("Category does not exist.");
            }


            return CreatedAtAction(nameof(GetProductById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
          
            return StatusCode(500, "An internal server error occurred while creating the product.");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditProduct(
    int id,
    [FromForm] UpdateProductDto dto)
    {
        var success = await _productService.UpdateProductAsync(id, dto, GetUserId());
        if (!success)
            return NotFound();
        return NoContent();
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var success = await _productService.DeleteProductAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }

    protected int? GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out var userId))
            return userId;
        return null;
    }
}