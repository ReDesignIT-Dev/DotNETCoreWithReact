namespace ShopAPI.Models;

public class CategoryImage
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public required string ThumbnailUrl { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
