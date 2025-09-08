namespace ShopAPI.Dtos.Product;

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public int? CategoryId { get; set; }
    
    public Dictionary<int, int>? CurrentImages { get; set; } 
    public List<IFormFile>? NewImages { get; set; } 
}
