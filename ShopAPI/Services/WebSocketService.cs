using Microsoft.AspNetCore.SignalR;
using ShopAPI.Hubs;
using ShopAPI.Interfaces;

namespace ShopAPI.Services;

public class WebSocketService : IWebSocketService
{
    private readonly IHubContext<TestHub> _hubContext;
    private readonly ILogger<WebSocketService> _logger;

    public WebSocketService(IHubContext<TestHub> hubContext, ILogger<WebSocketService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task TriggerButtonSuccessAsync(int userId, string requestId)
    {
        try
        {
            _logger.LogInformation("Triggering button success for user {UserId}, request {RequestId}", userId, requestId);
            
            // Wait 5 seconds before sending the success message
            await Task.Delay(5000);
            
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("ButtonSuccess", new { requestId, success = true, timestamp = DateTime.UtcNow });
                
            _logger.LogInformation("Button success triggered for user {UserId}, request {RequestId}", userId, requestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering button success for user {UserId}, request {RequestId}", userId, requestId);
        }
    }

    public async Task TriggerGlobalLogoutAsync(string reason = "Administrative logout")
    {
        try
        {
            _logger.LogInformation("Triggering global logout for all users. Reason: {Reason}", reason);
            
            // Send logout command to ALL connected clients
            await _hubContext.Clients.All
                .SendAsync("ForceLogout", new 
                { 
                    reason, 
                    timestamp = DateTime.UtcNow,
                    type = "global"
                });
                
            _logger.LogInformation("Global logout triggered successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering global logout");
        }
    }

    public async Task TriggerUserLogoutAsync(int userId, string reason = "Session invalidated")
    {
        try
        {
            _logger.LogInformation("Triggering logout for user {UserId}. Reason: {Reason}", userId, reason);
            
            // Send logout command to specific user
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("ForceLogout", new 
                { 
                    reason, 
                    timestamp = DateTime.UtcNow,
                    type = "individual"
                });
                
            _logger.LogInformation("User logout triggered for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering logout for user {UserId}", userId);
        }
    }

    public async Task SendGlobalNotificationAsync(string message, string type = "info")
    {
        try
        {
            _logger.LogInformation("Sending global notification: {Message}", message);
            
            await _hubContext.Clients.All
                .SendAsync("GlobalNotification", new 
                { 
                    message, 
                    type, 
                    timestamp = DateTime.UtcNow 
                });
                
            _logger.LogInformation("Global notification sent successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending global notification");
        }
    }
}