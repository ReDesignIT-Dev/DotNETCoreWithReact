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
        _logger.LogInformation("SignalR connection attempt - ConnectionId: {ConnectionId}, UserId: {UserId}",
            Context.ConnectionId, userId);

        if (userId.HasValue)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            _logger.LogInformation("User {UserId} connected to TestHub with connection {ConnectionId}", userId, Context.ConnectionId);
        }
        else
        {
            _logger.LogInformation("Anonymous user connected to TestHub with connection {ConnectionId}", Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        _logger.LogInformation("User {UserId} disconnected from TestHub - ConnectionId: {ConnectionId}, Exception: {Exception}",
            userId, Context.ConnectionId, exception?.Message);

        if (userId.HasValue)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }

    // Add a test method for debugging
    public async Task TestMethod(string message)
    {
        var userId = GetUserId();
        _logger.LogInformation("TestMethod called by user {UserId} with message: {Message}", userId, message);
        await Clients.Caller.SendAsync("TestResponse", $"Echo: {message}");
    }

    private int? GetUserId()
    {
        var userIdString = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out var userId))
            return userId;
        return null;
    }
}