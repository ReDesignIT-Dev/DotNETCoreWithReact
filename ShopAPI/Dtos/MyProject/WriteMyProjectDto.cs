namespace ShopAPI.Dtos.Project;

public class WriteMyProjectDto
{
    public string Title { get; set; } = default!;
    public string? Url { get; set; }
    public string Description { get; set; } = default!;
    public IFormFile? Image { get; set; }
}

