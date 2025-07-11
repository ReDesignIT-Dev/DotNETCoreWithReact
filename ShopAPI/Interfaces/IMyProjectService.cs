using ShopAPI.Dtos.Project;

namespace ShopAPI.Interfaces;

public interface IMyProjectService
{
    Task<List<ReadProjectDto>> GetAllAsync();
    Task<ReadProjectDto?> GetByIdAsync(int id);
    Task<ReadProjectDto> CreateAsync(WriteProjectDto dto, string? imageUrl);
    Task<bool> UpdateAsync(int id, WriteProjectDto dto, string? imageUrl);
    Task<bool> DeleteAsync(int id);
}
