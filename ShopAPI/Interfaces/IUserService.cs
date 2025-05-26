using ShopAPI.Dtos;

namespace ShopAPI.Interfaces;

public interface IUserService
{
    Task<UserDto?> RegisterAsync(RegisterDto dto);
    Task<UserDto?> LoginAsync(LoginDto dto);
    Task<bool> UserExistsAsync(string username);
}
