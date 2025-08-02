namespace ShopAPI.Dtos.Category;

public class CategoryImageDto
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public required string ThumbnailUrl { get; set; }

}
