using Microsoft.AspNetCore.Identity;
using ShopAPI.Enums;
using ShopAPI.Interfaces;
using ShopAPI.Models;

namespace ShopAPI.Services;

public class UserRoleService : IUserRoleService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public UserRoleService(UserManager<User> userManager, RoleManager<IdentityRole<int>> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;

    }

    public async Task<AddUserToRoleResult> AddUserToRoleAsync(int userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return AddUserToRoleResult.UserNotFound;
        if (!await _roleManager.RoleExistsAsync(role)) return AddUserToRoleResult.RoleNotFound;
        if (await _userManager.IsInRoleAsync(user, role)) return AddUserToRoleResult.AlreadyInRole;

        var result = await _userManager.AddToRoleAsync(user, role);
        return result.Succeeded ? AddUserToRoleResult.Success : AddUserToRoleResult.RoleNotFound;
    }

    public async Task<bool> RemoveUserFromRoleAsync(int userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return false;
        var result = await _userManager.RemoveFromRoleAsync(user, role);
        return result.Succeeded;
    }

    public async Task<IList<string>> GetUserRolesAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return new List<string>();
        return await _userManager.GetRolesAsync(user);
    }
}

