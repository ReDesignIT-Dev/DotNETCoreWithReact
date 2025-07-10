using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Product;
using ShopAPI.Interfaces;
using ShopAPI.Requests;
namespace ShopAPI.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminAndActive")]
[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<ReadProductDto>> CreateProduct(
        [FromForm] WriteProductDto dto,
        [FromServices] IFileStorageService fileStorage)
    {
        try
        {
            var imageUrls = new List<string>();
            if (dto.Images != null)
            {
                foreach (var file in dto.Images)
                {
                    var url = await fileStorage.SaveFileAsync(file);
                    imageUrls.Add(url);
                }
            }
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
        [FromServices] IFileStorageService fileStorage)
    {
        var imageUrls = new List<string>();
        if (dto.Images != null)
        {
            foreach (var file in dto.Images)
            {
                var url = await fileStorage.SaveFileAsync(file);
                imageUrls.Add(url);
            }
        }
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
        _logger.LogInformation("Product with id {ProductId} was deleted by user {User}.", id, User.Identity?.Name ?? "Unknown");
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