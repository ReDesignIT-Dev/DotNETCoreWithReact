namespace ShopAPI.Dtos.Category;

public class WriteCategoryDto
{
    public required string Name { get; set; }
    public string? ImageUrl { get; set; }
    public int? ParentId { get; set; }
    public required string ShortName { get; set; }
}
