using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShopAPI.Models;

namespace ShopAPI.EntityConfigurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // Username: required, unique, max length 64
        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(u => u.Username)
            .IsUnique();

        // PasswordHash and PasswordSalt: required
        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.PasswordSalt)
            .IsRequired();
    }
}
