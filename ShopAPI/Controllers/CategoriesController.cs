﻿using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos;
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
    public async Task<ActionResult<IEnumerable<WriteCategoryDto>>> GetCategories()
    {
        var categories = await _categoryService.GetCategoriesAsync();
        return Ok(categories);
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

    [HttpPost]
    public async Task<ActionResult<ReadCategoryDto>> CreateCategory([FromBody] WriteCategoryDto dto)
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
    public async Task<IActionResult> EditCategory(int id, [FromBody] WriteCategoryDto dto)
    {
        var success = await _categoryService.UpdateCategoryAsync(id, dto);
        if (!success)
            return NotFound();
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

        _logger.LogInformation("Category with id {CategoryId} was deleted by user {User}.", id, User.Identity?.Name ?? "Unknown");
        return NoContent();
    }
}
