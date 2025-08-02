using ShopAPI.Enums;

namespace ShopAPI.Requests;

public class ProductQueryParameters
{
    const int _maxPageSize = 100;
    private int _pageSize = 10;
    public int Page { get; set; } = 1;
    public string? Search { get; set; }
    public int? Category { get; set; }
    public bool IncludeCategories { get; set; } = false;
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; } = "Name"; // Default sorting by Name
    public SortOrder SortOrder { get; set; } = SortOrder.Asc;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > _maxPageSize ? _maxPageSize : value;
    }

}
