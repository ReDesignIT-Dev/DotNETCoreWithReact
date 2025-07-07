namespace ShopAPI.Models;

public class ProjectImage
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
