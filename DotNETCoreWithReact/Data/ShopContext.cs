using DotNETCoreWithReact.Models;
using Microsoft.EntityFrameworkCore;

namespace DotNETCoreWithReact.Data;


public class ShopContext : DbContext
{
    public ShopContext(DbContextOptions<ShopContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
}
