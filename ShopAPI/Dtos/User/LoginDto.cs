namespace ShopAPI.Dtos.User;

public class LoginDto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string RecaptchaToken { get; set; }

}
