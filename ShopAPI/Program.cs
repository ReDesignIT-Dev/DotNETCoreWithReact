using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using ShopAPI.Authorization;
using ShopAPI.Data;
using ShopAPI.Hubs;
using ShopAPI.Interfaces;
using ShopAPI.Models;
using ShopAPI.Services;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;

DotNetEnv.Env.Load();

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Infrastructure", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Migrations", Serilog.Events.LogEventLevel.Warning)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add systemd integration
builder.Services.AddSystemd();

builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ShopContext>();

// Add SignalR with detailed configuration
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});

// Add WebSocket service
builder.Services.AddScoped<IWebSocketService, WebSocketService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IMyProjectService, MyProjectService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<RecaptchaService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserRoleService, UserRoleService>();
builder.Services.AddScoped<IAuthorizationHandler, AdminHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ActiveUserHandler>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IHtmlSanitizerService, HtmlSanitizerService>();

// Configure Identity BEFORE authentication
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    options.SignIn.RequireConfirmedEmail = true;
    options.Password.RequiredLength = 12;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireDigit = true;
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";

    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<ShopContext>()
.AddDefaultTokenProviders();

// Configure authentication AFTER Identity but override the default schemes
builder.Services.AddAuthentication(options =>
{
    // Override the defaults set by AddIdentity
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"];
    if (string.IsNullOrEmpty(jwtKey))
    {
        throw new InvalidOperationException("Jwt:Key is not configured in the application settings.");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            
            if (!string.IsNullOrEmpty(accessToken) && 
                (path.StartsWithSegments("/Hub") || path.StartsWithSegments("/hubs/")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ActiveUserOnly", policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.Requirements.Add(new ActiveUserRequirement());
    });
    options.AddPolicy("AdminOnly", policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.Requirements.Add(new AdminRequirement());
    });
    options.AddPolicy("AdminAndActive", policy =>
    {
        policy.AuthenticationSchemes.Add(JwtBearerDefaults.AuthenticationScheme);
        policy.Requirements.Add(new AdminRequirement());
        policy.Requirements.Add(new ActiveUserRequirement());
    });
});

// Enhanced CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(corsBuilder =>
    {
        var allowedOrigins = new List<string>();

        if (builder.Environment.IsDevelopment())
        {
            // Development origins
            allowedOrigins.AddRange(new[]
            {
                "http://localhost:3000",
                "https://localhost:3000",
                "http://localhost:7288",
                "https://localhost:7288",
                "http://localhost:8000",
                "https://localhost:8000"
            });
        }

        // Production/common origins from configuration
        var frontendUrl = builder.Configuration["Frontend:BaseUrl"];
        var backendUrl = builder.Configuration["Backend:BaseUrl"];
        
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            allowedOrigins.Add(frontendUrl);
            // Also add www variant if not present
            if (!frontendUrl.Contains("www."))
            {
                var wwwUrl = frontendUrl.Replace("://", "://www.");
                allowedOrigins.Add(wwwUrl);
            }
        }
        
        if (!string.IsNullOrEmpty(backendUrl))
        {
            allowedOrigins.Add(backendUrl);
        }

        corsBuilder
            .WithOrigins(allowedOrigins.ToArray())
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var dbType = builder.Configuration["DEV_DB"] ?? "sqlite";

// Build PostgreSQL connection string from individual variables
if (dbType.ToLower() == "postgres")
{
    var host = builder.Configuration["POSTGRES_HOST"];
    var database = builder.Configuration["POSTGRES_DB"];
    var username = builder.Configuration["POSTGRES_USER"];
    var password = builder.Configuration["POSTGRES_PASSWORD"];
    var port = builder.Configuration["POSTGRES_PORT"] ?? "5432"; // Port is OK as default
    
    // Validate all required values are present
    if (string.IsNullOrEmpty(host))
        throw new InvalidOperationException("POSTGRES_HOST is required when using PostgreSQL");
    if (string.IsNullOrEmpty(database))
        throw new InvalidOperationException("POSTGRES_DB is required when using PostgreSQL");
    if (string.IsNullOrEmpty(username))
        throw new InvalidOperationException("POSTGRES_USER is required when using PostgreSQL");
    if (string.IsNullOrEmpty(password))
        throw new InvalidOperationException("POSTGRES_PASSWORD is required when using PostgreSQL");
    
    connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";
    builder.Services.AddDbContext<ShopContext>(opt => opt.UseNpgsql(connectionString));
}
else
{
    // Use SQLite connection string as-is
    builder.Services.AddDbContext<ShopContext>(opt => opt.UseSqlite(connectionString));
}

// Configure Data Protection for production - BEFORE builder.Build()
if (builder.Environment.IsProduction())
{
    var keysPath = builder.Configuration["Keys_Path"];
    if (string.IsNullOrEmpty(keysPath))
        throw new InvalidOperationException("Keys_Path is required");
    
    builder.Services.AddDataProtection()
        .SetApplicationName("ShopAPI")
        .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
        .SetDefaultKeyLifetime(TimeSpan.FromDays(90));
}

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

if (!builder.Environment.IsDevelopment())
{
    app.UseHsts();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopContext>();
    db.Database.Migrate();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
    string[] roles = ["Admin", "User", "Moderator"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<int>(role));
        }
    }

    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var adminEmail = config["ADMIN_EMAIL"] ?? "";
    var adminPassword = config["ADMIN_PASSWORD"] ?? "";
    if (adminEmail == "" || adminPassword == "")
    {
        throw new Exception("Admin email and password must be set in environment variables or appsettings.");
    }
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new User
        {
            UserName = "admin",
            Email = adminEmail,
            EmailConfirmed = true,
            IsActive = true
        };
        var result = await userManager.CreateAsync(adminUser, adminPassword);
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapControllers();

app.MapHub<MainHub>("/hub");

Log.Information("ShopAPI is fully started and ready to accept requests");

app.Run();
