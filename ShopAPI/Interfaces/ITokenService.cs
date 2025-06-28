using ShopAPI.Models;

namespace ShopAPI.Interfaces;

public interface ITokenService
{
    string CreateToken(User user, string sessionId, DateTime expiresAt);
}
