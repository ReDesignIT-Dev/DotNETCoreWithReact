using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos;
using ShopAPI.Models;

public class ProjectService
{
    private readonly ShopContext _context;

    public ProjectService(ShopContext context)
    {
        _context = context;
    }

    public async Task<List<ReadProjectDto>> GetAllAsync()
    {
        var projects = await _context.Projects
            .Include(p => p.Image)
            .ToListAsync();

        return projects.Select(p => new ReadProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            Url = p.Url,
            Description = p.Description,
            ImageUrl = p.Image?.Url
        }).ToList();
    }

    public async Task<ReadProjectDto?> GetByIdAsync(int id)
    {
        var project = await _context.Projects
            .Include(p => p.Image)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return null;

        return new ReadProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Url = project.Url,
            Description = project.Description,
            ImageUrl = project.Image?.Url
        };
    }

    public async Task<ReadProjectDto> CreateAsync(WriteProjectDto dto)
    {
        var project = new Project
        {
            Title = dto.Title,
            Url = dto.Url,
            Description = dto.Description,
            Image = dto.ImageUrl != null ? new ProjectImage { Url = dto.ImageUrl } : null
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return new ReadProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Url = project.Url,
            Description = project.Description,
            ImageUrl = project.Image?.Url
        };
    }

    public async Task<bool> UpdateAsync(int id, WriteProjectDto dto)
    {
        var project = await _context.Projects
            .Include(p => p.Image)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return false;

        project.Title = dto.Title;
        project.Url = dto.Url;
        project.Description = dto.Description;

        if (dto.ImageUrl != null)
        {
            if (project.Image == null)
                project.Image = new ProjectImage { Url = dto.ImageUrl };
            else
                project.Image.Url = dto.ImageUrl;
        }
        else
        {
            project.Image = null;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return false;

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }
}
