namespace ShopAPI.Interfaces;

public interface IWebSocketService
{
    Task TriggerButtonSuccessAsync(int userId, string requestId);
    Task TriggerGlobalLogoutAsync(string reason = "Administrative logout");
    Task TriggerUserLogoutAsync(int userId, string reason = "Session invalidated");
    Task SendGlobalNotificationAsync(string message, string type = "info");
}