using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using ShopAPI.Data;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ShopAPI.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _config;
    private readonly ShopContext _dbContext;
    private readonly ITokenService _tokenService;


    public UserService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration config,
        ShopContext dbContext,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _dbContext = dbContext;
        _tokenService = tokenService;

    }

    public async Task<UserDto?> RegisterAsync(RegisterDto dto)
    {
        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return null;

        return new UserDto
        {
            Id = user.Id,
            Username = user.UserName!,
        };
    }


    public async Task<UserDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return null;

        // Check if email is confirmed and account is active
        if (!user.EmailConfirmed || !user.IsActive)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!result.Succeeded)
            return null;

        var sessionId = Guid.NewGuid().ToString();
        var expiresAt = DateTime.UtcNow.AddDays(7);

        _dbContext.UserSessions.Add(new UserSession
        {
            UserId = user.Id,
            SessionId = sessionId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt
        });
        await _dbContext.SaveChangesAsync();
        var token = _tokenService.CreateToken(user, sessionId, expiresAt);
        return new UserDto
        {
            Id = user.Id,
            Username = user.UserName ?? string.Empty,
            Token = token
        };
    }



    public async Task<bool> UserExistsAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email) != null;
    }

}
