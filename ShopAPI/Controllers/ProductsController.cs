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
    public async Task<ActionResult<ProductListResponseDto>> GetProducts(
    [FromQuery] int? category,
    [FromQuery] string? search,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
    {
        var products = await _productService.GetProductsAsync(category, search, page, pageSize);
        var total = await _productService.GetProductsCountAsync(category, search);

        var response = new ProductListResponseDto
        {
            Count = total,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize),
            Products = products
        };

        return Ok(response);
    }


    [HttpPost]
    public async Task<ActionResult<ReadProductDto>> CreateProduct(
        [FromForm] WriteProductDto dto,
        [FromForm] List<IFormFile> images)
    {
        try
        {
            var imageUrls = await SaveImagesAsync(images);
            var created = await _productService.CreateProductAsync(dto, imageUrls);
            if (created == null)
                return BadRequest("Category does not exist.");
            return CreatedAtAction(nameof(GetProducts), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while processing your request.");
        }
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
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    private async Task<List<string>> SaveImagesAsync(List<IFormFile> images)
    {
        var imageUrls = new List<string>();
        foreach (var file in images)
        {
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                throw new InvalidOperationException("Unsupported file type.");

            if (file.Length > MaxFileSize)
                throw new InvalidOperationException("File size exceeds limit.");

            var fileName = $"{Guid.NewGuid()}{ext}";
            var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            Directory.CreateDirectory(uploadDir);
            var filePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            imageUrls.Add($"/uploads/{fileName}");
        }
        return imageUrls;
    }
}