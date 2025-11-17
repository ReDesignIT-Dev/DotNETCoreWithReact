using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopAPI.Models;
using ShopAPI.Constants;

namespace ShopAPI.EntityConfigurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        // Name: required, use constant for max length
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(FieldLimits.ProductNameMaxLength);

        // Description: allow HTML content, use constant for max length
        builder.Property(p => p.Description)
            .IsRequired()
            .HasMaxLength(FieldLimits.ProductDescriptionMaxLength);

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
