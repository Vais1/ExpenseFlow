using System.ComponentModel.DataAnnotations;
using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Models.DTOs;

/// <summary>
/// Request DTO for creating a new expense
/// </summary>
public record CreateExpenseDto
{
    /// <summary>
    /// Expense amount
    /// </summary>
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero")]
    public decimal Amount { get; init; }

    /// <summary>
    /// Expense category
    /// </summary>
    [Required]
    [MinLength(1)]
    public string Category { get; init; } = string.Empty;

    /// <summary>
    /// Expense description
    /// </summary>
    [Required]
    [MinLength(3)]
    [MaxLength(500)]
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Date when the expense was incurred
    /// </summary>
    [Required]
    public DateTime DateIncurred { get; init; }
}

/// <summary>
/// Response DTO for expense data
/// </summary>
public record ExpenseDto
{
    /// <summary>
    /// Expense ID
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// User ID who submitted the expense
    /// </summary>
    public string UserId { get; init; } = string.Empty;

    /// <summary>
    /// Expense amount
    /// </summary>
    public decimal Amount { get; init; }

    /// <summary>
    /// Expense category
    /// </summary>
    public string Category { get; init; } = string.Empty;

    /// <summary>
    /// Expense description
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Date when the expense was incurred
    /// </summary>
    public DateTime DateIncurred { get; init; }

    /// <summary>
    /// Current status of the expense
    /// </summary>
    public ExpenseStatus Status { get; init; }

    /// <summary>
    /// Reason for rejection (if rejected)
    /// </summary>
    public string? RejectionReason { get; init; }

    /// <summary>
    /// Timestamp when the expense was created
    /// </summary>
    public DateTime CreatedAt { get; init; }
}

/// <summary>
/// Request DTO for updating expense status
/// </summary>
public record UpdateExpenseStatusDto
{
    /// <summary>
    /// New status for the expense
    /// </summary>
    [Required]
    public ExpenseStatus Status { get; init; }

    /// <summary>
    /// Reason for rejection (required if status is Rejected)
    /// </summary>
    public string? Reason { get; init; }
}

