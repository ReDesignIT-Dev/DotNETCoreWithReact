namespace ShopAPI.Dtos.Project;

public class ReadProjectDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Url { get; set; }
    public required string Description { get; set; }
    public string? ImageUrl { get; set; }
}
