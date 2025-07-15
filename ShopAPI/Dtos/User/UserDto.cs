namespace ShopAPI.Dtos.User;

public class UserDto
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public string? Token { get; set; }
}
