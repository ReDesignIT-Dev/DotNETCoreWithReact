namespace ShopAPI.Models;

public class MyProject
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Url { get; set; }
    public required string Description { get; set; }
    public MyProjectImage? Image { get; set; }
}
