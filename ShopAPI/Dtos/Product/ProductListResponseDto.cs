namespace ShopAPI.Dtos.Product;

public class ProductListResponseDto
{
    public int Count { get; set; }
    public int TotalPages { get; set; }
    public IEnumerable<ReadProductDto> Products { get; set; } = [];
}

