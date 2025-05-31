namespace ShopAPI.Models;

public class ProductImage
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public int ProductId { get; set; }
    public required Product Product { get; set; }
}
