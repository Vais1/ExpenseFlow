using System.ComponentModel.DataAnnotations;
using VendorPay.Models;

namespace VendorPay.DTOs;

public class VendorCreateDto
{
    [Required(ErrorMessage = "Vendor name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Vendor name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required")]
    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string Category { get; set; } = string.Empty;
}

public class VendorUpdateDto
{
    [Required(ErrorMessage = "Vendor name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Vendor name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category is required")]
    [StringLength(50, ErrorMessage = "Category cannot exceed 50 characters")]
    public string Category { get; set; } = string.Empty;

    public VendorStatus? Status { get; set; }
}

public class VendorReadDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

