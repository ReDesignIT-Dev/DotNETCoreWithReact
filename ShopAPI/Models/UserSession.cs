namespace ShopAPI.Models;

public class UserSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string SessionId { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}

