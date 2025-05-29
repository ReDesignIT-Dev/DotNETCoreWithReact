namespace ShopAPI.Dtos;

public class ReadCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? ImageUrl { get; set; }
    public int? ParentId { get; set; }
    public string ShortName { get; set; } = "";
}
