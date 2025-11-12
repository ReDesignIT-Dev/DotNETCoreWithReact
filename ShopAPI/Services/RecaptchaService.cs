using System.Text.Json;

namespace ShopAPI.Services;

public class RecaptchaService
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<RecaptchaService> _logger;

    public RecaptchaService(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<RecaptchaService> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<bool> VerifyAsync(string recaptchaToken)
    {
        if (string.IsNullOrWhiteSpace(recaptchaToken))
        {
            _logger.LogWarning("Empty reCAPTCHA token provided");
            return false;
        }

        // Try both configuration patterns
        var secretKey = _config["Recaptcha:SecretKey"] ?? _config["Recaptcha__SecretKey"];
        
        if (string.IsNullOrWhiteSpace(secretKey))
        {
            _logger.LogError("reCAPTCHA secret key not configured");
            return false;
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            
            // Set timeout for the request
            client.Timeout = TimeSpan.FromSeconds(10);
            
            var requestContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("secret", secretKey),
                new KeyValuePair<string, string>("response", recaptchaToken),
                new KeyValuePair<string, string>("remoteip", GetClientIpAddress())
            });

            var response = await client.PostAsync(
                "https://www.google.com/recaptcha/api/siteverify", 
                requestContent);

            var json = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("reCAPTCHA API Response: {Response}", json);
            
            var result = JsonSerializer.Deserialize<RecaptchaResponse>(json, new JsonSerializerOptions 
            { 
                PropertyNameCaseInsensitive = true 
            });

            if (result?.Success != true)
            {
                var errors = result?.ErrorCodes?.Count > 0 
                    ? string.Join(", ", result.ErrorCodes)
                    : "Unknown error";
                _logger.LogWarning("reCAPTCHA validation failed with errors: {Errors}", errors);
                return false;
            }

            _logger.LogInformation("reCAPTCHA validation successful");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying reCAPTCHA token");
            return false;
        }
    }

    private string GetClientIpAddress()
    {
        // This would need to be injected via IHttpContextAccessor if needed
        return "127.0.0.1"; // Placeholder
    }

    private class RecaptchaResponse
    {
        public bool Success { get; set; }
        public double Score { get; set; }
        public string? Action { get; set; }
        public DateTime Challenge_ts { get; set; }
        public string? Hostname { get; set; }
        public List<string>? ErrorCodes { get; set; }
    }
}
