using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Project;
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
    public async Task<ActionResult<List<ReadMyProjectDto>>> GetAll()
    {
        var projects = await _service.GetAllAsync();
        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReadMyProjectDto>> GetById(int id)
    {
        var project = await _service.GetByIdAsync(id);
        if (project == null)
            return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<ActionResult<ReadMyProjectDto>> Create([FromForm] WriteMyProjectDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromForm] WriteMyProjectDto dto)
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
