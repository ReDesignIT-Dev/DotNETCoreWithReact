namespace ShopAPI.Dtos.Product;

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public int? CategoryId { get; set; }

    // Track image changes explicitly
    public List<int>? ImagesToDelete { get; set; } // IDs of images to remove
    public List<IFormFile>? NewImages { get; set; } // New images to add
}
