using Microsoft.AspNetCore.Identity;
using ShopAPI.Data;
using ShopAPI.Dtos.User;
using ShopAPI.Interfaces;
using ShopAPI.Models;

namespace ShopAPI.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ShopContext _dbContext;
    private readonly ITokenService _tokenService;
    private readonly IUserRoleService _userRoleService;

    public UserService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        ShopContext dbContext,
        ITokenService tokenService,
        IUserRoleService userRoleService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _dbContext = dbContext;
        _tokenService = tokenService;
        _userRoleService = userRoleService;


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

        var result = await _signInManager.PasswordSignInAsync(user, dto.Password, isPersistent: false, lockoutOnFailure: true);
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

        public async Task<List<AdminUserDto>> GetAllUsersWithRolesAsync()
    {
        var users = _userManager.Users.ToList();
        var result = new List<AdminUserDto>();

        foreach (var user in users)
        {
            var roles = await _userRoleService.GetUserRolesAsync(user.Id);
            result.Add(new AdminUserDto
            {
                Id = user.Id,
                Username = user.UserName ?? "",
                Email = user.Email ?? "",
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                EmailConfirmed = user.EmailConfirmed,
                Roles = roles.ToList()
            });
        }
        return result;
    }

}
