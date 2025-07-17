using ShopAPI.Enums;

namespace ShopAPI.Interfaces;

public interface IUserRoleService
{
    Task<AddUserToRoleResult> AddUserToRoleAsync(int userId, string role);
    Task<bool> RemoveUserFromRoleAsync(int userId, string role);
    Task<IList<string>> GetUserRolesAsync(int userId);
}

