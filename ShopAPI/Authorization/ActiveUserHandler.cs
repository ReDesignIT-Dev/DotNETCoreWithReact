using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using ShopAPI.Models;
using System.Security.Claims;

namespace ShopAPI.Authorization;

public class ActiveUserHandler : AuthorizationHandler<ActiveUserRequirement>
{
    private readonly UserManager<User> _userManager;

    public ActiveUserHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ActiveUserRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return;

        var user = await _userManager.FindByIdAsync(userId);
        if (user != null && user.IsActive)
        {
            context.Succeed(requirement);
        }
    }
}
