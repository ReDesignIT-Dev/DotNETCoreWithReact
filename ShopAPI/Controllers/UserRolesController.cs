using global::ShopAPI.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ShopAPI.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminAndActive")]
[ApiController]
[Route("api/shop/[controller]")]
public class UserRolesController : ControllerBase
{
    private readonly IUserRoleService _userRoleService;

    public UserRolesController(IUserRoleService userRoleService)
    {
        _userRoleService = userRoleService;
    }

    [HttpPost("{userId}/add")]
    public async Task<IActionResult> AddRole(int userId, [FromBody] string role)
    {
        var success = await _userRoleService.AddUserToRoleAsync(userId, role);
        if (!success) return NotFound("User not found or role invalid.");
        return Ok("Role added.");
    }

    [HttpPost("{userId}/remove")]
    public async Task<IActionResult> RemoveRole(int userId, [FromBody] string role)
    {
        var success = await _userRoleService.RemoveUserFromRoleAsync(userId, role);
        if (!success) return NotFound("User not found or role invalid.");
        return Ok("Role removed.");
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetRoles(int userId)
    {
        var roles = await _userRoleService.GetUserRolesAsync(userId);
        return Ok(roles);
    }
}

