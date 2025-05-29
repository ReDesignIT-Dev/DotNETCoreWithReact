using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        // Name: required, max length 64
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(64);

        // ParentId: optional (for category hierarchy)
        builder.Property(c => c.ParentId)
            .IsRequired(false);

        // Self-referencing relationship for parent/children
        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Products: one-to-many
        builder.HasMany(c => c.Products)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId);
    }
}
