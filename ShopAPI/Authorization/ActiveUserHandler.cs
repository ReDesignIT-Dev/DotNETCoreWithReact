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
        
        var userIdFromSub = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userIdFromSub2 = context.User.FindFirstValue("sub");
      
        var userId = userIdFromSub ?? userIdFromSub2;
        
        if (userId == null)
        {
            return;
        }
        
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return;
        }
                
        if (user.IsActive)
        {
            context.Succeed(requirement);
        }
    }
}
