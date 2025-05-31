using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        // Url: required, max length 256 (adjust as needed)
        builder.Property(i => i.Url)
            .IsRequired()
            .HasMaxLength(256);

        // ProductId: required
        builder.Property(i => i.ProductId)
            .IsRequired();

        // Relationship: ProductImage belongs to one Product, Product has many ProductImages
        builder.HasOne(i => i.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
