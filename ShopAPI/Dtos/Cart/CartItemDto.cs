using ShopAPI.Dtos.Product;

namespace ShopAPI.Dtos.Cart;

public class CartItemDto
{
    public ReadProductDto Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal TotalAmount { get; set; }
}