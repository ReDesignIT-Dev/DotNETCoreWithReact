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
}