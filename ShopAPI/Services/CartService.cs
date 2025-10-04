using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ShopAPI.Data;
using ShopAPI.Dtos.Cart;
using ShopAPI.Dtos.Product;
using ShopAPI.Interfaces;
using ShopAPI.Models;

namespace ShopAPI.Services;

public class CartService : ICartService
{
    private readonly ShopContext _context;
    private readonly ILogger<CartService> _logger;

    public CartService(ShopContext context, ILogger<CartService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ReadCartDto?> GetCartAsync(int userId)
    {
        var cart = await GetOrCreateCartAsync(userId);
        
        return new ReadCartDto
        {
            Id = cart.Id,
            Items = cart.Items.Select(item => new CartItemDto
            {
                Product = new ReadProductDto
                {
                    Id = item.Product.Id,
                    Name = item.Product.Name,
                    Description = item.Product.Description,
                    Price = item.Product.Price,
                    CategoryId = item.Product.CategoryId,
                    Slug = item.Product.Slug,
                    Images = item.Product.Images
                        .OrderBy(img => img.Position)
                        .Select(img => new ProductImageDto
                        {
                            Id = img.Id,
                            Url = img.Url,
                            ThumbnailUrl = img.ThumbnailUrl,
                            Position = img.Position
                        }).ToList()
                },
                Quantity = item.Quantity,
            }).ToList(),
            TotalAmount = cart.Items.Sum(item => item.Product.Price * item.Quantity),
        };
    }

    public async Task<ReadCartDto?> AddToCartAsync(int userId, AddToCartDto dto)
    {
        try
        {
            var cart = await GetOrCreateCartAsync(userId);
            
            // Check if product exists
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);
                
            if (product == null)
            {
                _logger.LogWarning("Product {ProductId} not found", dto.ProductId);
                return null;
            }

            // Check if item already exists in cart
            var existingItem = cart.Items.FirstOrDefault(item => item.ProductId == dto.ProductId);
            
            if (existingItem != null)
            {
                // Update quantity
                existingItem.Quantity += dto.Quantity;
            }
            else
            {
                // Add new item
                var cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                };
                
                cart.Items.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Added {Quantity} of product {ProductId} to cart for user {UserId}", 
                dto.Quantity, dto.ProductId, userId);
            
            return await GetCartAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding product {ProductId} to cart for user {UserId}", 
                dto.ProductId, userId);
            throw;
        }
    }

    public async Task<ReadCartDto?> UpdateCartItemAsync(int userId, int productId, UpdateCartItemDto dto)
    {
        try
        {
            var cart = await GetOrCreateCartAsync(userId);
            var cartItem = cart.Items.FirstOrDefault(item => item.ProductId == productId);
            
            if (cartItem == null)
            {
                _logger.LogWarning("Cart item for product {ProductId} not found for user {UserId}", 
                    productId, userId);
                return null;
            }

            if (dto.Quantity <= 0)
            {
                // Remove item if quantity is 0 or negative
                cart.Items.Remove(cartItem);
                _context.CartItems.Remove(cartItem);
            }
            else
            {
                cartItem.Quantity = dto.Quantity;
            }


            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Updated cart item for product {ProductId} to quantity {Quantity} for user {UserId}", 
                productId, dto.Quantity, userId);
            
            return await GetCartAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cart item for product {ProductId} for user {UserId}", 
                productId, userId);
            throw;
        }
    }

    public async Task<bool> RemoveFromCartAsync(int userId, int productId)
    {
        try
        {
            var cart = await GetOrCreateCartAsync(userId);
            var cartItem = cart.Items.FirstOrDefault(item => item.ProductId == productId);
            
            if (cartItem == null)
                return false;

            cart.Items.Remove(cartItem);
            _context.CartItems.Remove(cartItem);
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Removed product {ProductId} from cart for user {UserId}", 
                productId, userId);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing product {ProductId} from cart for user {UserId}", 
                productId, userId);
            throw;
        }
    }

    public async Task<bool> ClearCartAsync(int userId)
    {
        try
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);
                
            if (cart == null)
                return true; // No cart to clear

            _context.CartItems.RemoveRange(cart.Items);
            
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Cleared cart for user {UserId}", userId);
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing cart for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetCartItemCountAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);
            
        return cart?.Items.Sum(item => item.Quantity) ?? 0;
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(item => item.Product)
            .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId
            };
            
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }
}