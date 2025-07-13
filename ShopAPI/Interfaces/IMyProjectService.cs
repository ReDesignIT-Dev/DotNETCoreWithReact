using ShopAPI.Dtos.Project;

namespace ShopAPI.Interfaces;

public interface IMyProjectService
{
    Task<List<ReadMyProjectDto>> GetAllAsync();
    Task<ReadMyProjectDto?> GetByIdAsync(int id);
    Task<ReadMyProjectDto> CreateAsync(WriteMyProjectDto dto, string? imageUrl);
    Task<bool> UpdateAsync(int id, WriteMyProjectDto dto, string? imageUrl);
    Task<bool> DeleteAsync(int id);
}
