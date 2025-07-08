using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class ProjectConfiguration : IEntityTypeConfiguration<MyProject>
{
    public void Configure(EntityTypeBuilder<MyProject> builder)
    {
        builder.Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(128);

        builder.Property(p => p.Description)
            .IsRequired();

        builder.HasOne(p => p.Image)
            .WithOne(i => i.Project)
            .HasForeignKey<MyProjectImage>(i => i.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}