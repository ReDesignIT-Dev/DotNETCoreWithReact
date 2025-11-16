using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        // Name: required, increased max length to accommodate longer product names
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(255);

        // Description: allow HTML content, much larger limit
        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(10000) // 10,000 characters should be plenty for rich HTML descriptions
            .HasColumnType("NVARCHAR(MAX)"); // Use MAX for SQL Server to allow very large content

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
