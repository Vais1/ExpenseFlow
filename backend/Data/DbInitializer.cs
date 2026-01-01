using VendorPay.Models;

namespace VendorPay.Data;

public static class DbInitializer
{
    public static void Seed(AppDbContext context)
    {
        // Seed Admin user if none exists
        if (!context.Users.Any(u => u.Role == UserRole.Admin))
        {
            var adminUser = new User
            {
                Username = "admin",
                // BCrypt hash of "admin123" - change in production!
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123", workFactor: 11),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            context.SaveChanges();
            Console.WriteLine("✓ Admin user seeded (username: admin, password: admin123)");
        }

        // Seed Vendors
        if (!context.Vendors.Any())
        {
            var vendors = new List<Vendor>
            {
                new Vendor { Name = "Office Depot", Category = "Office Supplies" },
                new Vendor { Name = "Tech Supplies Inc", Category = "Electronics" },
                new Vendor { Name = "Cleaning Services Co", Category = "Services" },
                new Vendor { Name = "Catering Experts", Category = "Food & Beverage" }
            };

            context.Vendors.AddRange(vendors);
            context.SaveChanges();
        }
    }
}
