using ShopAPI.Dtos.Product;

namespace ShopAPI.Dtos.Cart;

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public ReadProductDto Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal ItemTotal { get; set; }
    public DateTime AddedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}