namespace ShopAPI.Dtos;

public class ReadCategoryDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int? ParentId { get; set; }
    public required string ShortName { get; set; }
}
