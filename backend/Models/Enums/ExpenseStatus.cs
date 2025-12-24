namespace ExpenseFlow.Models.Enums;

/// <summary>
/// Expense claim status enumeration
/// </summary>
public enum ExpenseStatus
{
    /// <summary>
    /// Expense is pending approval
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Expense has been approved
    /// </summary>
    Approved = 1,

    /// <summary>
    /// Expense has been rejected
    /// </summary>
    Rejected = 2,

    /// <summary>
    /// Expense has been withdrawn by the submitter
    /// </summary>
    Withdrawn = 3
}

