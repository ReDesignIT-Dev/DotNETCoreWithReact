using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;
using ShopAPI.Services;
using Microsoft.AspNetCore.Identity;
using ShopAPI.Models;
using System.Net;

namespace ShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly RecaptchaService _reCaptchaService;
    private readonly UserManager<User> _userManager;
    private readonly EmailService _emailService;

    public AuthController(
        IUserService userService,
        RecaptchaService reCaptchaService,
        UserManager<User> userManager,
        EmailService emailService)
    {
        _userService = userService;
        _reCaptchaService = reCaptchaService;
        _userManager = userManager;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        var recaptchaValid = await _reCaptchaService.VerifyAsync(dto.RecaptchaToken);
        if (!recaptchaValid)
            return BadRequest("reCAPTCHA validation failed.");

        var userDto = await _userService.RegisterAsync(dto);
        if (userDto == null)
            return BadRequest("Username or email is already taken.");

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return StatusCode(500, "User creation failed.");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmationLink = Url.Action(
            nameof(ConfirmEmail),
            "Auth",
            new { userId = user.Id, token = WebUtility.UrlEncode(token) },
            protocol: Request.Scheme);

        var subject = "Confirm your email";
        var body = $"Please confirm your account by clicking <a href=\"{confirmationLink}\">here</a>.";

        await _emailService.SendAsync(user.Email!, subject, body);

        return Ok(new { user = userDto });
    }


    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(int userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return BadRequest("Invalid user.");

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
            return Ok("Email confirmed!");
        return BadRequest("Email confirmation failed.");
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        var recaptchaValid = await _reCaptchaService.VerifyAsync(dto.RecaptchaToken);
        if (!recaptchaValid)
            return BadRequest("reCAPTCHA validation failed.");

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized("Invalid email or password.");

        if (!user.EmailConfirmed)
            return Unauthorized("Email not confirmed.");

        var userDto = await _userService.LoginAsync(dto);
        if (userDto == null)
            return Unauthorized("Invalid email or password.");
        return Ok(userDto);
    }
}
