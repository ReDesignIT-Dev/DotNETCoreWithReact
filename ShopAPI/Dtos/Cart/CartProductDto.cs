namespace ShopAPI.Dtos.Cart;

public class CartProductDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public string? Slug { get; set; }
    public string? MainImageUrl { get; set; }
    public string? MainImageThumbnailUrl { get; set; }
    public string? MainImageAltText { get; set; }  // Include this for accessibility
}