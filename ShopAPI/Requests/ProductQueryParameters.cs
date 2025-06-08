namespace ShopAPI.Requests;

public class ProductQueryParameters
{
    const int _maxPageSize = 100;
    private int _pageSize = 10;
    public int Page { get; set; } = 1;
    public string? Search { get; set; }
    public int? Category { get; set; }

    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; } = "Name"; // Default sorting by Name
    public bool SortDescending { get; set; } = false; // Default sorting order is ascending
    public string? OrderBy
    {
        get => SortBy + (SortDescending ? " desc" : "");
        set
        {
            if (value != null)
            {
                var parts = value.Split(' ');
                SortBy = parts[0];
                SortDescending = parts.Length > 1 && parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase);
            }
        }
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > _maxPageSize ? _maxPageSize : value;
    }

}
