using System.Net;
using System.Net.Mail;

namespace ShopAPI.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        private readonly string _templatePath;

        public EmailService(IConfiguration config)
        {
            _config = config;
            // Adjust the path as needed for your project structure
            _templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "EmailTemplates", "ActivationEmailTemplate.html");
        }

        public async Task SendAsync(string toEmail, string subject, string body)
        {
            var smtpHost = _config["Smtp:Host"] ?? throw new InvalidOperationException("SMTP host is not configured.");
            var smtpPortString = _config["Smtp:Port"] ?? throw new InvalidOperationException("SMTP port is not configured.");
            var smtpUser = _config["Smtp:User"] ?? throw new InvalidOperationException("SMTP user is not configured.");
            var smtpPass = _config["Smtp:Pass"] ?? throw new InvalidOperationException("SMTP password is not configured.");
            var fromEmail = _config["Smtp:From"] ?? throw new InvalidOperationException("SMTP from address is not configured.");

            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("Recipient email cannot be null or empty.", nameof(toEmail));

            var smtpPort = int.Parse(smtpPortString);

            var mail = new MailMessage(fromEmail, toEmail, subject, body)
            {
                IsBodyHtml = true
            };

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            await client.SendMailAsync(mail);
        }

        private string LoadTemplate()
        {
            if (!File.Exists(_templatePath))
                throw new FileNotFoundException("Activation email template not found.", _templatePath);

            return File.ReadAllText(_templatePath);
        }

        public string GetActivationEmailBody(string username, string activationLink)
        {
            var template = LoadTemplate();
            return template
                .Replace("{{username}}", WebUtility.HtmlEncode(username))
                .Replace("{{activation_link}}", activationLink);
        }
    }
}
