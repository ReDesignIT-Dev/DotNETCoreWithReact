using System.Text.RegularExpressions;

namespace ShopAPI.Helpers;
public static class SlugHelper
{
    public static string GenerateSlug(string name, int id)
    {
        // Replace non-letter/digit with hyphen
        var slug = Regex.Replace(name, @"[^A-Za-z0-9]+", "-");
        // Remove consecutive hyphens
        slug = Regex.Replace(slug, @"-+", "-");
        // Trim hyphens from start/end
        slug = slug.Trim('-');
        // Append id
        slug = $"{slug}-{id}";
        return slug;
    }
}

