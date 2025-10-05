namespace ShopAPI.Interfaces;

public interface IWebSocketService
{
    Task TriggerButtonSuccessAsync(int userId, string requestId);
}