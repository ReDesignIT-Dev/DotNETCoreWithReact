using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Product;
using ShopAPI.Interfaces;
using ShopAPI.Requests;
using ShopAPI.Enums;
using System.Security.Claims;
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
            Products = products
        };

        return Ok(response);
    }


    [HttpPost]
    public async Task<ActionResult<ReadProductDto>> CreateProduct([FromForm] WriteProductDto dto)
    {
        var created = await _productService.CreateProductAsync(dto, GetUserId());
        if (created == null)
            return BadRequest("Category does not exist.");
        return CreatedAtAction(nameof(GetProducts), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditProduct(
    int id,
    [FromForm] WriteProductDto dto)
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
        _logger.LogInformation("Product with id {ProductId} was deleted by user {User}.", id, User.Identity?.Name ?? "Unknown");
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