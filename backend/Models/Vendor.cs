using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VendorPay.Models;

public enum VendorStatus
{
    Active = 0,
    Inactive = 1
}

public class Vendor
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required(ErrorMessage = "Vendor name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Vendor name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required")]
    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string Category { get; set; } = string.Empty;

    public VendorStatus Status { get; set; } = VendorStatus.Active;

    public bool IsDeleted { get; set; } = false;

    // Navigation property
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
