namespace ShopAPI.Dtos;

public class UserDto
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public string? Token { get; set; }
}
