using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos.User;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using ShopAPI.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
namespace ShopAPI.Controllers;

[ApiController]
[Route("api/shop/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly RecaptchaService _reCaptchaService;
    private readonly UserManager<User> _userManager;
    private readonly EmailService _emailService;
    private readonly IWebHostEnvironment _env;
    private readonly ShopContext _dbContext;
    private readonly IConfiguration _config;
    
    public AuthController(
        IUserService userService,
        RecaptchaService reCaptchaService,
        UserManager<User> userManager,
        EmailService emailService,
        IWebHostEnvironment env,
        ShopContext dbContext,
        IConfiguration config,
        ILogger<AuthController> logger)
    {
        _userService = userService;
        _reCaptchaService = reCaptchaService;
        _userManager = userManager;
        _emailService = emailService;
        _env = env;
        _dbContext = dbContext;
        _config = config;
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

        if (dto.Password != dto.PasswordConfirm)
            return BadRequest("Passwords do not match.");

        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return StatusCode(500, "User creation failed.");

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var frontendBaseUrl = _config["Frontend:BaseUrl"];
        var confirmationLink = $"{frontendBaseUrl}/shop/activate/{user.Id}/{WebUtility.UrlEncode(token)}";
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
        
        var result = await _userManager.ConfirmEmailAsync(user, token); // Use token directly

        if (result.Succeeded)
        {
            user.IsActive = true;
            await _userManager.UpdateAsync(user);
            return Ok("Email confirmed!");
        }

        var errorDescriptions = string.Join("; ", result.Errors.Select(e => e.Description));
        return BadRequest($"Email confirmation failed: {errorDescriptions}");
    }


    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto? dto)
    {
        string? email = dto?.Email;
        string? password = dto?.Password;
        string? recaptchaToken = dto?.RecaptchaToken;

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
        {
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Basic "))
            {
                var encoded = authHeader.Substring("Basic ".Length).Trim();
                var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
                var parts = decoded.Split(':', 2);
                if (parts.Length == 2)
                {
                    email = parts[0];
                    password = parts[1];
                }
            }
        }

        if (!_env.IsDevelopment())
        {
            var recaptchaValid = await _reCaptchaService.VerifyAsync(recaptchaToken ?? "");
            if (!recaptchaValid)
                return BadRequest("reCAPTCHA validation failed.");
        }

        // Add null check before calling FindByEmailAsync
        if (string.IsNullOrEmpty(email))
            return Unauthorized("Invalid email or password.");

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return Unauthorized("Invalid email or password.");

        if (!user.EmailConfirmed)
            return Unauthorized("Email not confirmed.");

        if (!user.IsActive)
            return Unauthorized("Account is not active.");

        if (await _userManager.IsLockedOutAsync(user))
        {
            var lockoutEnd = user.LockoutEnd?.UtcDateTime;
            return Unauthorized(new
            {
                message = "Account is locked due to too many failed login attempts.",
                lockoutEnd
            });
        }

        var loginDto = new LoginDto
        {
            Email = email!,
            Password = password!,
            RecaptchaToken = recaptchaToken ?? ""
        };

        var userDto = await _userService.LoginAsync(loginDto);

        if (userDto == null)
            return Unauthorized("Invalid email or password.");
        return Ok(userDto);
    }


    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("logout")]
    public async Task<IActionResult> LogoutCurrentSession()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        var sessionIdClaim = User.FindFirst(JwtRegisteredClaimNames.Jti);

        if (userIdClaim == null)
        {
            return BadRequest("User ID not found in token.");
        }
        if (sessionIdClaim == null)
        {
            return BadRequest("Session ID not found in token.");
        }

        var userId = int.Parse(userIdClaim.Value);
        var sessionId = sessionIdClaim.Value;

        var session = await _dbContext.UserSessions
            .FirstOrDefaultAsync(s => s.UserId == userId && s.SessionId == sessionId);

        if (session != null)
        {
            _dbContext.UserSessions.Remove(session);
            await _dbContext.SaveChangesAsync();
        }

        return Ok("Logged out from current session.");
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("logout-all")]
    public async Task<IActionResult> LogoutAllSessions()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var sessions = _dbContext.UserSessions.Where(s => s.UserId == userId);
        _dbContext.UserSessions.RemoveRange(sessions);
        await _dbContext.SaveChangesAsync();

        return Ok("Logged out from all sessions.");
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "AdminAndActive")]
    [HttpGet("users")]
    public async Task<ActionResult<List<AdminUserDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllUsersWithRolesAsync();
        return Ok(users);
    }

}
