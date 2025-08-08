namespace ShopAPI.Dtos.Category;

public class CategoryPathDto
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public string ShortName { get; set; } = default!;
}

