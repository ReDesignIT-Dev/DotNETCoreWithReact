using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos.MyProject;
using ShopAPI.Enums;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using static ShopAPI.Services.FileStorageService;

namespace ShopAPI.Services;
public class MyProjectService : IMyProjectService
{
    private readonly ShopContext _context;

    private readonly IFileStorageService _fileStorage;

    public MyProjectService(ShopContext context, IFileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }
    public async Task<List<ReadMyProjectDto>> GetAllAsync()
    {
        var projects = await _context.Projects
            .Include(p => p.Image)
            .ToListAsync();

        return projects.Select(p => new ReadMyProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            Url = p.Url,
            Description = p.Description,
            Image = p.Image == null
    ? null
    : new MyProjectImageDto
    {
        Id = p.Image.Id,
        Url = p.Image.Url,
        ThumbnailUrl = p.Image.ThumbnailUrl
    },

            ThumbnailUrl = p.Image?.ThumbnailUrl
        }).ToList();
    }

    public async Task<ReadMyProjectDto?> GetByIdAsync(int id)
    {
        var project = await _context.Projects
            .Include(p => p.Image)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return null;

        return new ReadMyProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Url = project.Url,
            Description = project.Description,
            Image = project.Image == null
    ? null
    : new MyProjectImageDto
    {
        Id = project.Image.Id,
        Url = project.Image.Url,
        ThumbnailUrl = project.Image.ThumbnailUrl
    },
        };
    }

    public async Task<ReadMyProjectDto> CreateAsync(WriteMyProjectDto dto)
    {
        ImageSaveResult? imageResult = null;
        if (dto.Image != null)
            imageResult = await _fileStorage.SaveImageAsync(dto.Image, ImageType.MyProject, null);

        var project = new MyProject
        {
            Title = dto.Title,
            Url = dto.Url,
            Description = dto.Description,
            Image = imageResult != null
                ? new MyProjectImage { Url = imageResult.Url, ThumbnailUrl = imageResult.ThumbnailUrl }
                : null
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return new ReadMyProjectDto
        {
            Id = project.Id,
            Title = project.Title,
            Url = project.Url,
            Description = project.Description,
            Image = project.Image == null
                    ? null
                    : new MyProjectImageDto
                    {
        Id = project.Image.Id,
        Url = project.Image.Url,
        ThumbnailUrl = project.Image.ThumbnailUrl
    },
            ThumbnailUrl = project.Image?.ThumbnailUrl
        };
    }

    public async Task<bool> UpdateAsync(int id, WriteMyProjectDto dto)
    {
        var project = await _context.Projects
            .Include(p => p.Image)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return false;

        project.Title = dto.Title;
        project.Url = dto.Url;
        project.Description = dto.Description;

        if (dto.Image != null)
        {
            var imageResult = await _fileStorage.SaveImageAsync(dto.Image, ImageType.MyProject, null);
            if (project.Image == null)
                project.Image = new MyProjectImage { Url = imageResult.Url, ThumbnailUrl = imageResult.ThumbnailUrl };
            else
            {
                project.Image.Url = imageResult.Url;
                project.Image.ThumbnailUrl = imageResult.ThumbnailUrl;
            }
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
