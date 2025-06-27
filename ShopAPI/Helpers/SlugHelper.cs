using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace ShopAPI.Helpers;
public static class SlugHelper
{
    public static string GenerateSlug(string name, int id)
    {
        string normalized = name.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        string noDiacritics = sb.ToString().Normalize(NormalizationForm.FormC);

        string slug = Regex.Replace(noDiacritics, @"[^a-zA-Z0-9\s-]", "");
        slug = Regex.Replace(slug, @"[\s-]+", "-");
        slug = slug.Trim('-').ToLowerInvariant();
        return $"{slug}-{id}";
    }
}


