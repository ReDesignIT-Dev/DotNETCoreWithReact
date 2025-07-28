namespace ShopAPI.Models;

public class MyProjectImage
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public required string ThumbnailUrl { get; set; }
    public int ProjectId { get; set; }
    public MyProject Project { get; set; } = null!;

}
