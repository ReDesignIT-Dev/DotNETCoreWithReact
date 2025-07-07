using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos;
using ShopAPI.Dtos.Product;
using ShopAPI.Services;

namespace ShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private readonly ProjectService _service;

    public ProjectController(ProjectService service)
    {
        _service = service;
    }

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
    public async Task<ActionResult<ReadProjectDto>> Create([FromBody] WriteProjectDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] WriteProjectDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);
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
}
