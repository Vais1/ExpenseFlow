using Microsoft.EntityFrameworkCore;
using VendorPay.Models;

namespace VendorPay.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Vendor> Vendors { get; set; } = null!;
    public DbSet<Invoice> Invoices { get; set; } = null!;
    public DbSet<InvoiceActivity> InvoiceActivities { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            
            entity.HasIndex(e => e.Username)
                .IsUnique();

            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.PasswordHash)
                .IsRequired();

            entity.Property(e => e.Role)
                .IsRequired()
                .HasConversion<string>(); // Store enum as string in database

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Configure Vendor entity
        modelBuilder.Entity<Vendor>(entity =>
        {
            entity.ToTable("Vendors");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Configure Invoice entity
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("Invoices");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            entity.Property(e => e.Status)
                .IsRequired()
                .HasConversion<string>(); // Store enum as string in database

            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Configure relationships
            entity.HasOne(e => e.Vendor)
                .WithMany(v => v.Invoices)
                .HasForeignKey(e => e.VendorId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

            entity.HasOne(e => e.User)
                .WithMany(u => u.Invoices)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete
        });

        // Configure InvoiceActivity entity
        modelBuilder.Entity<InvoiceActivity>(entity =>
        {
            entity.ToTable("InvoiceActivities");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Action)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(e => e.PerformedByUsername)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.PerformedByRole)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.Metadata)
                .HasMaxLength(1000);

            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.HasOne(e => e.Invoice)
                .WithMany()
                .HasForeignKey(e => e.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.PerformedBy)
                .WithMany()
                .HasForeignKey(e => e.PerformedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.InvoiceId);
            entity.HasIndex(e => e.Timestamp);
        });

        // Seed initial data (optional)
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed an admin user for testing
        // Password: "Admin@123" (you should hash this properly)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                PasswordHash = "$2a$11$8YGY9YGY9YGY9YGY9YGY9eDummy", // Replace with actual hash
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
    }
}
