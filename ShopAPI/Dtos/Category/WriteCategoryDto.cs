namespace ShopAPI.Dtos.Category;

public class WriteCategoryDto
{
    public string Name { get; set; } = "";
    public string? ImageUrl { get; set; }
    public int? ParentId { get; set; }
    public string ShortName { get; set; } = "";
}
