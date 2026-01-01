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

    // VendorId is now optional if VendorName is provided
    public int? VendorId { get; set; }

    [StringLength(100, MinimumLength = 2, ErrorMessage = "Vendor name must be between 2 and 100 characters")]
    public string? VendorName { get; set; }

    [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
    public string? Notes { get; set; }
}

public class InvoiceUpdateStatusDto
{
    [Required(ErrorMessage = "Status is required")]
    public InvoiceStatus Status { get; set; }

    [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters")]
    public string? RejectionReason { get; set; }
}

public class InvoiceReadDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public string? Notes { get; set; }
    
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

/// <summary>
/// DTO for User to edit their own pending invoice
/// </summary>
public class InvoiceUpdateDto
{
    [Required(ErrorMessage = "Amount is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Description is required")]
    [StringLength(500, MinimumLength = 5, ErrorMessage = "Description must be between 5 and 500 characters")]
    public string Description { get; set; } = string.Empty;

    public int? VendorId { get; set; }

    [StringLength(100, MinimumLength = 2, ErrorMessage = "Vendor name must be between 2 and 100 characters")]
    public string? VendorName { get; set; }

    [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
    public string? Notes { get; set; }
}

/// <summary>
/// Dashboard statistics for Admin
/// </summary>
public class DashboardStatsDto
{
    public int TotalInvoices { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public int WithdrawnCount { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal ApprovedAmount { get; set; }
}

/// <summary>
/// User's personal statistics
/// </summary>
public class UserStatsDto
{
    public int TotalSubmitted { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
    public int WithdrawnCount { get; set; }
    public decimal TotalApprovedAmount { get; set; }
    public decimal PendingAmount { get; set; }
}

/// <summary>
/// Bulk status update for Admin
/// </summary>
public class BulkStatusUpdateDto
{
    [Required(ErrorMessage = "Invoice IDs are required")]
    public List<int> InvoiceIds { get; set; } = new();

    [Required(ErrorMessage = "Status is required")]
    public InvoiceStatus Status { get; set; }

    [StringLength(500, ErrorMessage = "Rejection reason cannot exceed 500 characters")]
    public string? RejectionReason { get; set; }
}
