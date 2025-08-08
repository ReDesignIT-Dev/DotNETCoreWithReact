namespace ShopAPI.Dtos.User;

public class LoginDto
{
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? RecaptchaToken { get; set; }

}
