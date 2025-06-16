using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;
using ShopAPI.Services;
using Microsoft.AspNetCore.Identity;
using ShopAPI.Models;
using System.Net;
using DotNetEnv;

namespace ShopAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly RecaptchaService _reCaptchaService;
    private readonly UserManager<User> _userManager;
    private readonly EmailService _emailService;
    private readonly IWebHostEnvironment _env;

    public AuthController(
        IUserService userService,
        RecaptchaService reCaptchaService,
        UserManager<User> userManager,
        EmailService emailService,
        IWebHostEnvironment env)
    {
        _userService = userService;
        _reCaptchaService = reCaptchaService;
        _userManager = userManager;
        _emailService = emailService;
        _env = env; 
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto)
    {
        if (!_env.IsDevelopment())
        {
            var recaptchaValid = await _reCaptchaService.VerifyAsync(dto.RecaptchaToken);
            if (!recaptchaValid)
                return BadRequest("reCAPTCHA validation failed.");
        }

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

        var subject = "Activate Your Account";
        var body = _emailService.GetActivationEmailBody(user.UserName ?? user.Email!, confirmationLink!);

        await _emailService.SendAsync(user.Email!, subject, body);

        return Ok(new { user = userDto });
    }


    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail(int userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return BadRequest("Invalid user.");
        if (user.IsActive)
            return BadRequest("Email already confirmed.");

        var decodedToken = WebUtility.UrlDecode(token);
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (result.Succeeded)
        {
            user.IsActive = true;
            await _userManager.UpdateAsync(user);
            return Ok("Email confirmed!");
        }
        return BadRequest("Email confirmation failed.");
    }


    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto)
    {
        if (!_env.IsDevelopment())
        {
            var recaptchaValid = await _reCaptchaService.VerifyAsync(dto.RecaptchaToken);
            if (!recaptchaValid)
                return BadRequest("reCAPTCHA validation failed.");
        }

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized("Invalid email or password.");

        if (!user.EmailConfirmed)
            return Unauthorized("Email not confirmed.");

        if (!user.IsActive)
            return Unauthorized("Account is not active.");

        var userDto = await _userService.LoginAsync(dto);
        if (userDto == null)
            return Unauthorized("Invalid email or password.");
        return Ok(userDto);
    }

}
