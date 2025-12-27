namespace ShopAPI.Dtos.Category;

public class CategoryTreeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public CategoryImageDto? Image { get; set; }
    public int? ParentId { get; set; }
    public string ShortName { get; set; } = default!;
    public int ProductCount { get; set; }
    public bool ShowOnHomePage { get; set; } = false;
    public List<CategoryTreeDto> Children { get; set; } = new();
}

