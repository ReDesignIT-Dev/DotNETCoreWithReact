using ShopAPI.Dtos.Product;

namespace ShopAPI.Dtos.Cart;

public class CartItemDto
{
    public CartProductDto Product { get; set; } = null!;
    public int Quantity { get; set; }
}