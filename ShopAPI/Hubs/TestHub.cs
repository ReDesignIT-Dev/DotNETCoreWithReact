using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ShopAPI.Hubs;

[Authorize(Policy = "ActiveUserOnly")]
public class TestHub : Hub
{
    private readonly ILogger<TestHub> _logger;

    public TestHub(ILogger<TestHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        var userName = Context.User?.Identity?.Name;
        
        _logger.LogInformation("SignalR connection attempt - ConnectionId: {ConnectionId}, UserId: {UserId}, UserName: {UserName}",
            Context.ConnectionId, userId, userName);

        // Add to user-specific group
        if (userId.HasValue)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            _logger.LogInformation("User {UserId} connected to TestHub with connection {ConnectionId}", userId, Context.ConnectionId);
        }
        else
        {
            _logger.LogInformation("Anonymous user connected to TestHub with connection {ConnectionId}", Context.ConnectionId);
        }

        // Add to global groups for notifications
        await Groups.AddToGroupAsync(Context.ConnectionId, "AllUsers");
        
        // Add to role-based groups if user has roles
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
        
        _logger.LogInformation("User {UserId} disconnected from TestHub - ConnectionId: {ConnectionId}, Exception: {Exception}",
            userId, Context.ConnectionId, exception?.Message);

        // Cleanup is automatic for groups when connection closes
        await base.OnDisconnectedAsync(exception);
    }

    // Test method for debugging
    public async Task TestMethod(string message)
    {
        var userId = GetUserId();
        _logger.LogInformation("TestMethod called by user {UserId} with message: {Message}", userId, message);
        await Clients.Caller.SendAsync("TestResponse", $"Echo: {message}");
    }

    // Allow clients to join custom groups
    public async Task JoinGroup(string groupName)
    {
        var userId = GetUserId();
        _logger.LogInformation("User {UserId} joining group {GroupName}", userId, groupName);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    // Allow clients to leave custom groups
    public async Task LeaveGroup(string groupName)
    {
        var userId = GetUserId();
        _logger.LogInformation("User {UserId} leaving group {GroupName}", userId, groupName);
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