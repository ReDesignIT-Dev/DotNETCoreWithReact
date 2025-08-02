namespace ShopAPI.Models;

public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Slug { get; set; } = string.Empty;
    public required string ShortName { get; set; }
    public int? ParentId { get; set; }
    public Category? Parent { get; set; }
    public List<Category> Children { get; set; } = new();
    public List<Product> Products { get; set; } = new();
    public CategoryImage? Image { get; set; }

}
