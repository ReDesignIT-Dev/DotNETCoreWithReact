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


    public UserService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration config,
        ShopContext dbContext)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _dbContext = dbContext;
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
        var token = CreateToken(user, sessionId, expiresAt);
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

    private string CreateToken(User user, string sessionId, DateTime expiresAt)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Jti, sessionId)
        };


        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}
