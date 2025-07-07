using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class ProjectImageConfiguration : IEntityTypeConfiguration<ProjectImage>
{
    public void Configure(EntityTypeBuilder<ProjectImage> builder)
    {
        builder.Property(i => i.Url)
            .IsRequired()
            .HasMaxLength(256);
    }
}
