namespace ShopAPI.Dtos.Product;

public class ProductImageDto
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public required string ThumbnailUrl { get; set; }
    public int Position { get; set; }
}
