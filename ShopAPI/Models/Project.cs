namespace ShopAPI.Models;

public class Project
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string Url { get; set; } = string.Empty;
    public required string Description { get; set; }
    public ProjectImage? Image { get; set; } // Single image
}
