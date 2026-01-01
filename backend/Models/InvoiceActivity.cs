using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VendorPay.Models;

public enum InvoiceActivityAction
{
    Created = 0,
    Approved = 1,
    Rejected = 2,
    Updated = 3,
    Deleted = 4
}

public class InvoiceActivity
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int InvoiceId { get; set; }

    [Required]
    public InvoiceActivityAction Action { get; set; }

    [Required]
    public int PerformedById { get; set; }

    [Required]
    [StringLength(50)]
    public string PerformedByUsername { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string PerformedByRole { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Metadata { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("InvoiceId")]
    public virtual Invoice? Invoice { get; set; }

    [ForeignKey("PerformedById")]
    public virtual User? PerformedBy { get; set; }
}
