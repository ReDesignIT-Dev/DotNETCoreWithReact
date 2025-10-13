using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Interfaces;
using System.Security.Claims;

namespace ShopAPI.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminAndActive")]
[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IWebSocketService _webSocketService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IWebSocketService webSocketService, ILogger<AdminController> logger)
    {
        _webSocketService = webSocketService;
        _logger = logger;
    }

    [HttpPost("logout-all-users")]
    public async Task<ActionResult> LogoutAllUsers([FromBody] LogoutAllUsersRequest request)
    {
        var adminId = GetUserId();
        var reason = request.Reason ?? "Administrative action";
        
        _logger.LogWarning("Admin {AdminId} initiated global logout. Reason: {Reason}", adminId, reason);
        
        try
        {
            await _webSocketService.TriggerGlobalLogoutAsync(reason);
            
            return Ok(new 
            { 
                message = "Global logout initiated successfully",
                reason,
                initiatedBy = adminId,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initiate global logout");
            return StatusCode(500, "Failed to initiate global logout");
        }
    }

    [HttpPost("logout-user/{userId}")]
    public async Task<ActionResult> LogoutSpecificUser(int userId, [FromBody] LogoutUserRequest request)
    {
        var adminId = GetUserId();
        var reason = request.Reason ?? "Administrative action";
        
        _logger.LogWarning("Admin {AdminId} initiated logout for user {UserId}. Reason: {Reason}", 
            adminId, userId, reason);
        
        try
        {
            await _webSocketService.TriggerUserLogoutAsync(userId, reason);
            
            return Ok(new 
            { 
                message = "User logout initiated successfully",
                userId,
                reason,
                initiatedBy = adminId,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initiate logout for user {UserId}", userId);
            return StatusCode(500, "Failed to initiate user logout");
        }
    }

    [HttpPost("send-global-notification")]
    public async Task<ActionResult> SendGlobalNotification([FromBody] GlobalNotificationRequest request)
    {
        var adminId = GetUserId();
        
        _logger.LogInformation("Admin {AdminId} sending global notification: {Message}", adminId, request.Message);
        
        try
        {
            await _webSocketService.SendGlobalNotificationAsync(request.Message, request.Type ?? "info");
            
            return Ok(new 
            { 
                message = "Global notification sent successfully",
                sentBy = adminId,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send global notification");
            return StatusCode(500, "Failed to send global notification");
        }
    }

    private int? GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out var userId))
            return userId;
        return null;
    }
}

// DTOs for the requests
public class LogoutAllUsersRequest
{
    public string? Reason { get; set; }
}

public class LogoutUserRequest
{
    public string? Reason { get; set; }
}

public class GlobalNotificationRequest
{
    public required string Message { get; set; }
    public string? Type { get; set; } // info, warning, error, success
}