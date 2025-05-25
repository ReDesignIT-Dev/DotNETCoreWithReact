namespace ShopAPI.Models;

public class Product
{
    public int Id { get; set; }
    public required string Name { get; set; } = "";
    public required string? Description { get; set; }
    public required decimal Price { get; set; }
    public int CategoryId { get; set; }
    public required Category Category { get; set; }
}
