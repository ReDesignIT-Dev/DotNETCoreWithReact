using Ganss.Xss;

namespace ShopAPI.Services;

public interface IHtmlSanitizerService
{
    string Sanitize(string html);
}

public class HtmlSanitizerService : IHtmlSanitizerService
{
    private readonly HtmlSanitizer _sanitizer;

    public HtmlSanitizerService()
    {
        _sanitizer = new HtmlSanitizer();
        
        // Allow common HTML tags for rich text
        _sanitizer.AllowedTags.Clear();
        _sanitizer.AllowedTags.UnionWith(new[] {
            "p", "br", "strong", "b", "em", "i", "u", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "blockquote", "a", "img", "div", "span", "sub", "sup",
            "table", "thead", "tbody", "tr", "th", "td", "hr"
        });

        // Allow common attributes
        _sanitizer.AllowedAttributes.Clear();
        _sanitizer.AllowedAttributes.UnionWith(new[] {
            "href", "src", "alt", "title", "class", "style", "target", "width", "height"
        });

        // Allow data attributes for styling
        _sanitizer.AllowedSchemes.UnionWith(new[] { "http", "https", "data" });
    }

    public string Sanitize(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;

        return _sanitizer.Sanitize(html);
    }
}