using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ShopAPI.Hubs;

[Authorize(Policy = "ActiveUserOnly")]
public class MainHub : Hub
{
    private readonly ILogger<MainHub> _logger;

    public MainHub(ILogger<MainHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        var userName = Context.User?.Identity?.Name;
        
            Context.ConnectionId, userId, userName);

        // Add to user-specific group
        if (userId.HasValue)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, "AllUsers");
        
        if (Context.User?.IsInRole("Admin") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
        
        if (Context.User?.IsInRole("User") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "RegularUsers");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        
            userId, Context.ConnectionId, exception?.Message);

        // Cleanup is automatic for groups when connection closes
        await base.OnDisconnectedAsync(exception);
    }

    // Test method for debugging
    public async Task TestMethod(string message)
    {
        var userId = GetUserId();
        await Clients.Caller.SendAsync("TestResponse", $"Echo: {message}");
    }

    // Allow clients to join custom groups
    public async Task JoinGroup(string groupName)
    {
        var userId = GetUserId();
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    // Allow clients to leave custom groups
    public async Task LeaveGroup(string groupName)
    {
        var userId = GetUserId();
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    private int? GetUserId()
    {
        var userIdString = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out var userId))
            return userId;
        return null;
    }
}