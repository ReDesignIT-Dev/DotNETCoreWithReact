using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        // Name: required, max length 32
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(32);

        // Description: optional, no length limit (or set one if you want)
        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(500); // Example: limit to 500 chars, adjust as needed

        // Price: required
        builder.Property(p => p.Price)
            .IsRequired();

        // CategoryId: required
        builder.Property(p => p.CategoryId)
            .IsRequired();

        // Relationship: Product belongs to one Category, Category has many Products
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
