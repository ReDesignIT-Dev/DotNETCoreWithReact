using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;

namespace ShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    public ProductsController(IProductService productService) => _productService = productService;

    [HttpGet]
    public async Task<ActionResult> GetProducts(
        [FromQuery] int? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var products = await _productService.GetProductsAsync(category, search, page, pageSize);
        var total = await _productService.GetProductsCountAsync(category, search);

        return Ok(new
        {
            count = total,
            totalPages = (int)Math.Ceiling(total / (double)pageSize),
            products
        });
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] ProductDto dto)
    {
        var created = await _productService.CreateProductAsync(dto);
        if (created == null)
            return BadRequest("Category does not exist.");
        return CreatedAtAction(nameof(GetProducts), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditProduct(int id, [FromBody] ProductDto dto)
    {
        var success = await _productService.UpdateProductAsync(id, dto);
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
}
