using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;
using ShopAPI.Services;


namespace ShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly RecaptchaService _reCaptchaService;

    public AuthController(IUserService userService, RecaptchaService reCaptchaService)
    {
        _userService = userService;
        _reCaptchaService = reCaptchaService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        var recaptchaValid = await _reCaptchaService.VerifyAsync(dto.RecaptchaToken);
        if (!recaptchaValid)
            return BadRequest("reCAPTCHA validation failed.");

        var user = await _userService.RegisterAsync(dto);
        if (user == null)
            return BadRequest("Username is already taken.");
        return Ok(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var recaptchaValid = await _reCaptchaService.VerifyAsync(dto.RecaptchaToken);
        if (!recaptchaValid)
            return BadRequest("reCAPTCHA validation failed.");

        var user = await _userService.LoginAsync(dto);
        if (user == null)
            return Unauthorized("Invalid username or password.");
        return Ok(user);
    }
}
