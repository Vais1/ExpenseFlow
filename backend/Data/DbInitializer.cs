using VendorPay.Models;

namespace VendorPay.Data;

public static class DbInitializer
{
    public static void Seed(AppDbContext context)
    {
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
