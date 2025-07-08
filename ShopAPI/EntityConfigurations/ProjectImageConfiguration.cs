using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class ProjectImageConfiguration : IEntityTypeConfiguration<MyProjectImage>
{
    public void Configure(EntityTypeBuilder<MyProjectImage> builder)
    {
        builder.Property(i => i.Url)
            .IsRequired()
            .HasMaxLength(256);
    }
}
