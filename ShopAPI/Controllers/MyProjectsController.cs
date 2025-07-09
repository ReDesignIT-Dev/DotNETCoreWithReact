using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;

namespace ShopAPI.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminAndActive")]
[ApiController]
[Route("api/[controller]")]
public class MyProjectsController : ControllerBase
{
    private readonly IMyProjectService _service;

    public MyProjectsController(IMyProjectService service)
    {
        _service = service;
    }
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<List<ReadProjectDto>>> GetAll()
    {
        var projects = await _service.GetAllAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReadProjectDto>> GetById(int id)
    {
        var project = await _service.GetByIdAsync(id);
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ReadProjectDto>> Create(
        [FromForm] WriteProjectDto dto,
        [FromServices] IFileStorageService fileStorage)
    {
        string? imageUrl = null;
        if (dto.Image != null)
        {
            imageUrl = await fileStorage.SaveFileAsync(dto.Image);
        }

        var created = await _service.CreateAsync(dto, imageUrl);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromForm] WriteProjectDto dto,
        [FromServices] IFileStorageService fileStorage)
    {
        string? imageUrl = null;
        if (dto.Image != null)
        {
            imageUrl = await fileStorage.SaveFileAsync(dto.Image);
        }
        var updated = await _service.UpdateAsync(id, dto, imageUrl);
        if (!updated)
            return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound();
        return NoContent();
    }

    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    private async Task<string> SaveImageAsync(IFormFile image)
    {
        var ext = Path.GetExtension(image.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Unsupported file type.");

        if (image.Length > MaxFileSize)
            throw new InvalidOperationException("File size exceeds limit.");

        var fileName = $"{Guid.NewGuid()}{ext}";
        var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        Directory.CreateDirectory(uploadDir);
        var filePath = Path.Combine(uploadDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }
        return $"/uploads/{fileName}";
    }

}
