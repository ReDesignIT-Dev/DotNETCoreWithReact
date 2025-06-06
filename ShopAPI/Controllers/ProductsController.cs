using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Product;
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
    public async Task<ActionResult<ReadProductDto>> CreateProduct(
    [FromForm] WriteProductDto dto,
    [FromForm] List<IFormFile> images)
    {
        var imageUrls = await SaveImagesAsync(images);

        var created = await _productService.CreateProductAsync(dto, imageUrls);
        if (created == null)
            return BadRequest("Category does not exist.");
        return CreatedAtAction(nameof(GetProducts), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> EditProduct(
        int id,
        [FromForm] WriteProductDto dto,
        [FromForm] List<IFormFile> images)
    {
        var imageUrls = await SaveImagesAsync(images);

        var success = await _productService.UpdateProductAsync(id, dto, imageUrls);
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

    // Helper method to save images and return their URLs
    private async Task<List<string>> SaveImagesAsync(List<IFormFile> images)
    {
        var imageUrls = new List<string>();
        foreach (var file in images)
        {
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine("uploads", fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            imageUrls.Add($"/uploads/{fileName}");
        }
        return imageUrls;
    }
}