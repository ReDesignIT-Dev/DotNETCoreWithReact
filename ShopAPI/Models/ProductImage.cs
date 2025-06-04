namespace ShopAPI.Models;

public class ProductImage
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
