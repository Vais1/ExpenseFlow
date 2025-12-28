using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Models.Entities;

/// <summary>
/// Expense entity representing an expense claim
/// </summary>
public class Expense
{
    /// <summary>
    /// Unique identifier for the expense
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// ID of the user who submitted this expense
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Expense amount in the base currency
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Category of the expense (e.g., "Travel", "Medical", "Equipment")
    /// </summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the expense
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Date when the expense was incurred
    /// </summary>
    public DateTime DateIncurred { get; set; }

    /// <summary>
    /// Current status of the expense claim
    /// </summary>
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Pending;

    /// <summary>
    /// Reason for rejection (only populated when status is Rejected)
    /// </summary>
    public string? RejectionReason { get; set; }

    /// <summary>
    /// Timestamp when the expense was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
