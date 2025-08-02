namespace ShopAPI.Dtos.MyProject;

public class ReadMyProjectDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Url { get; set; }
    public required string Description { get; set; }
    public MyProjectImageDto? Image { get; set; }
    public string? ThumbnailUrl { get; set; }
}
