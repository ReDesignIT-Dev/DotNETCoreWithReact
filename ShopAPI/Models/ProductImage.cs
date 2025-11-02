namespace ShopAPI.Models;

public class ProductImage
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public required string ThumbnailUrl { get; set; }
    public int Position { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string AltText { get; set; } = "Product Image";
}
