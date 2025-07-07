namespace ShopAPI.Dtos;

public class ReadProjectDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string Url { get; set; } = string.Empty;
    public required string Description { get; set; }
    public string? ImageUrl { get; set; }
}
