using ShopAPI.Dtos.Cart;

namespace ShopAPI.Interfaces;

public interface ICartService
{
    Task<ReadCartDto?> GetCartAsync(int userId);
    Task<ReadCartDto?> AddToCartAsync(int userId, AddToCartDto dto);
    Task<ReadCartDto?> UpdateCartItemAsync(int userId, int productId, UpdateCartItemDto dto);
    Task<bool> RemoveFromCartAsync(int userId, int productId);
    Task<bool> ClearCartAsync(int userId);
    Task<int> GetCartItemCountAsync(int userId);
}