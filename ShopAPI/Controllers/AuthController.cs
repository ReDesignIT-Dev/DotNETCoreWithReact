using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ShopAPI.Data;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using ShopAPI.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
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
    private readonly ShopContext _dbContext;
    


    public AuthController(
        IUserService userService,
        RecaptchaService reCaptchaService,
        UserManager<User> userManager,
        EmailService emailService,
        IWebHostEnvironment env,
        ShopContext dbContext,
        ILogger<AuthController> logger)
    {
        _userService = userService;
        _reCaptchaService = reCaptchaService;
        _userManager = userManager;
        _emailService = emailService;
        _env = env;
        _dbContext = dbContext;
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

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("Test")]
    public IActionResult Test()
    {
        return Ok("Test successful!");
    }



}
