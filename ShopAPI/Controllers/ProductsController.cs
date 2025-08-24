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
            _logger.LogInformation("CreateProduct started. Name: {ProductName}, CategoryId: {CategoryId}, Price: {Price}, ImagesCount: {ImagesCount}", 
                dto.Name, dto.CategoryId, dto.Price, dto.Images?.Count ?? 0);

            // Log detailed DTO validation
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                _logger.LogWarning("CreateProduct failed: Name is null or empty");
                return BadRequest("Product name is required.");
            }

            if (dto.Price <= 0)
            {
                _logger.LogWarning("CreateProduct failed: Invalid price {Price}", dto.Price);
                return BadRequest("Product price must be greater than 0.");
            }

            if (dto.CategoryId <= 0)
            {
                _logger.LogWarning("CreateProduct failed: Invalid categoryId {CategoryId}", dto.CategoryId);
                return BadRequest("Valid category ID is required.");
            }

            // Log image details if present
            if (dto.Images != null && dto.Images.Any())
            {
                _logger.LogInformation("Processing {Count} images for product creation", dto.Images.Count);
                foreach (var (image, index) in dto.Images.Select((img, idx) => (img, idx)))
                {
                    _logger.LogInformation("Image {Index}: Name={FileName}, Size={Size} bytes, ContentType={ContentType}", 
                        index + 1, image.FileName, image.Length, image.ContentType);
                }
            }

            var userId = GetUserId();
            _logger.LogInformation("User ID for product creation: {UserId}", userId);

            var created = await _productService.CreateProductAsync(dto, userId);
            
            if (created == null)
            {
                _logger.LogWarning("CreateProduct failed: Service returned null - Category {CategoryId} does not exist", dto.CategoryId);
                return BadRequest("Category does not exist.");
            }

            _logger.LogInformation("Product created successfully with ID: {ProductId}, Name: {ProductName}", 
                created.Id, created.Name);
            
            return CreatedAtAction(nameof(GetProductById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating product. Name: {ProductName}, CategoryId: {CategoryId}", 
                dto.Name, dto.CategoryId);
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