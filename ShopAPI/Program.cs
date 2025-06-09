using ShopAPI.Data;
using Microsoft.EntityFrameworkCore;
using ShopAPI.Interfaces;
using ShopAPI.Services;
DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<RecaptchaService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins("http://localhost:3000", "https://localhost:3000")
               .AllowCredentials();
    });
});



var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var app = builder.Build();
app.UseCors();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddDbContext<ShopContext>(opt =>
        opt.UseSqlite(connectionString));
}
else
{
    builder.Services.AddDbContext<ShopContext>(opt =>
        opt.UseNpgsql(connectionString));
    app.UseHsts(); // HTTP Strict Transport Security (HSTS)
}



using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopContext>();
    db.Database.Migrate(); // This will create the DB and apply all migrations
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
