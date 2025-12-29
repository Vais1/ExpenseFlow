using System.ComponentModel.DataAnnotations;
using VendorPay.Models;

namespace VendorPay.DTOs;

public class InvoiceCreateDto
{
    [Required(ErrorMessage = "Amount is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Description is required")]
    [StringLength(500, MinimumLength = 5, ErrorMessage = "Description must be between 5 and 500 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vendor is required")]
    public int VendorId { get; set; }
}

public class InvoiceUpdateStatusDto
{
    [Required(ErrorMessage = "Status is required")]
    public InvoiceStatus Status { get; set; }
}

public class InvoiceReadDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Foreign Key References
    public int VendorId { get; set; }
    public int UserId { get; set; }
    
    // Navigation Properties (Expanded)
    public string VendorName { get; set; } = string.Empty;
    public string VendorCategory { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    
    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
