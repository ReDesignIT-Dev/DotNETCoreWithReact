using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Category;
using ShopAPI.Interfaces;
using System.Text.RegularExpressions;

namespace ShopAPI.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminAndActive")]
[ApiController]
[Route("api/shop/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReadCategoryDto>>> GetCategories()
    {
        var categories = await _categoryService.GetCategoriesAsync();
        return Ok(categories);
    }

    [AllowAnonymous]
    [HttpGet("count")]
    public async Task<ActionResult<int>> GetCategoriesCount()
    {
        var count = await _categoryService.GetCategoriesCountAsync();
        return Ok(count);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<ActionResult<WriteCategoryDto>> GetCategory(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null)
            return NotFound();
        return Ok(category);
    }

    [AllowAnonymous]
    [HttpGet("tree")]
    public async Task<ActionResult<IEnumerable<CategoryTreeDto>>> GetCategoryTree()
    {
        var tree = await _categoryService.GetCategoryTreeAsync();
        return Ok(tree);
    }

    [AllowAnonymous]
    [HttpGet("path/{categoryId}")]
    public async Task<ActionResult<List<CategoryPathDto>>> GetCategoryPathForCategory(
        int categoryId, [FromQuery] bool includeSelf = true)
    {
        var category = await _categoryService.GetCategoryByIdAsync(categoryId);
        if (category == null)
            return NotFound();

        var path = new List<CategoryPathDto>();

        // If includeSelf is true, add the starting category
        if (includeSelf)
        {
            path.Insert(0, new CategoryPathDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                ShortName = category.ShortName
            });
        }

        // Traverse up the tree
        while (category.ParentId != null)
        {
            category = await _categoryService.GetCategoryByIdAsync(category.ParentId.Value);
            if (category == null)
                break;
            path.Insert(0, new CategoryPathDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                ShortName = category.ShortName
            });
        }

        return Ok(path);
    }

    [HttpPost]
    public async Task<ActionResult<ReadCategoryDto>> CreateCategory([FromForm] WriteCategoryDto dto)
    {
        if (!Regex.IsMatch(dto.Name, @"^[A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ \-]+$"))
        {
            return BadRequest("Name can only contain letters (including Polish), digits, spaces, and hyphens.");
        }

        var created = await _categoryService.CreateCategoryAsync(dto);

        // Optionally validate the slug here if you want an extra check
        if (!Regex.IsMatch(created.Slug, @"^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$"))
        {
            return BadRequest("Generated slug is invalid.");
        }

        return CreatedAtAction(nameof(GetCategory), new { id = created.Id }, created);
    }



    [HttpPut("{id}")]
    public async Task<IActionResult> EditCategory(int id, [FromForm] WriteCategoryDto dto)
    {
        // Log request details
        _logger.LogInformation("EditCategory called for ID: {CategoryId}", id);
        _logger.LogInformation("Content-Type: {ContentType}", Request.ContentType);
        _logger.LogInformation("Content-Length: {ContentLength}", Request.ContentLength);
        
        // Log all headers
        foreach (var header in Request.Headers)
        {
            _logger.LogInformation("Header: {Key} = {Value}", header.Key, header.Value);
        }

        // Check if body binding succeeded
        if (dto == null)
        {
            _logger.LogWarning("DTO is null - body binding failed");
            return BadRequest("Invalid request body");
        }

        _logger.LogInformation($"DTO received - Name: {dto.Name}," +
            $" ShortName: {dto.ShortName}, ParentId: {dto.ParentId}, " +
            $"Image: {dto.Image != null}, RemoveImage: {dto.RemoveImage}");

        var success = await _categoryService.UpdateCategoryAsync(id, dto);
        if (!success)
        {
            _logger.LogWarning("Update failed - Category with id {CategoryId} not found", id);
            return NotFound();
        }
        
        _logger.LogInformation("Category {CategoryId} updated successfully", id);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var success = await _categoryService.DeleteCategoryAsync(id);
        if (!success)
        {
            _logger.LogWarning("Delete attempt failed: Category with id {CategoryId} does not exist.", id);
            return NotFound();
        }

        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("/api/shop/search-associated-categories")]
    public async Task<ActionResult<List<CategoryTreeDto>>> GetSearchAssociatedCategories([FromQuery] string? search)
    {
        _logger.LogWarning("Search term received: {SearchTerm}", search);
        if (string.IsNullOrWhiteSpace(search))
            return Ok(new List<CategoryTreeDto>());

        var categories = await _categoryService.GetSearchAssociatedCategoriesAsync(search);
        return Ok(categories);
    }
}
