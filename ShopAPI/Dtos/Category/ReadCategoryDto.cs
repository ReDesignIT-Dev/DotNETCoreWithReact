namespace ShopAPI.Dtos.Category;

public class ReadCategoryDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Slug { get; set; } = string.Empty;
    public CategoryImageDto? Image { get; set; }
    public int? ParentId { get; set; }
    public required string ShortName { get; set; }
    public List<int> ChildrenIds { get; set; } = new();
    public int ProductCount { get; set; }
}
