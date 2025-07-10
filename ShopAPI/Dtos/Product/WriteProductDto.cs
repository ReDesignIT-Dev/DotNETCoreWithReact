namespace ShopAPI.Dtos.Product;

public class WriteProductDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public List<IFormFile>? Images { get; set; }

}
