using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ShopAPI.Data;
using ShopAPI.Dtos;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ShopAPI.Services;

public class UserService : IUserService
{
    private readonly ShopContext _context;
    private readonly IConfiguration _config;

    public UserService(ShopContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<UserDto?> RegisterAsync(RegisterDto dto)
    {
        if (await UserExistsAsync(dto.Username))
            return null;

        using var hmac = new HMACSHA512();
        var user = new User
        {
            Username = dto.Username,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
            PasswordSalt = hmac.Key
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Token = CreateToken(user)
        };
    }

    public async Task<UserDto?> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(x => x.Username == dto.Username);
        if (user == null)
            return null;

        using var hmac = new HMACSHA512(user.PasswordSalt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
        if (!computedHash.SequenceEqual(user.PasswordHash))
            return null;

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Token = CreateToken(user)
        };
    }

    public async Task<bool> UserExistsAsync(string username)
    {
        return await _context.Users.AnyAsync(x => x.Username == username);
    }

    private string CreateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
