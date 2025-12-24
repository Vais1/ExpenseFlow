using ExpenseFlow.Models.DTOs;
using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Services;

/// <summary>
/// Service interface for expense operations
/// </summary>
public interface IExpenseService
{
    /// <summary>
    /// Submit a new expense claim
    /// </summary>
    Task<ExpenseDto> SubmitExpenseAsync(CreateExpenseDto dto, string userId);

    /// <summary>
    /// Get all expenses for a specific user
    /// </summary>
    Task<IEnumerable<ExpenseDto>> GetMyExpensesAsync(string userId);

    /// <summary>
    /// Get all pending expense approvals (Manager only)
    /// </summary>
    Task<IEnumerable<ExpenseDto>> GetPendingApprovalsAsync();

    /// <summary>
    /// Update the status of an expense
    /// </summary>
    Task<ExpenseDto> UpdateExpenseStatusAsync(string expenseId, ExpenseStatus newStatus, string? reason);

    /// <summary>
    /// Update an expense (only for pending expenses by the owner)
    /// </summary>
    Task<ExpenseDto> UpdateExpenseAsync(string expenseId, string userId, CreateExpenseDto dto);

    /// <summary>
    /// Withdraw an expense (only for pending expenses by the owner)
    /// </summary>
    Task<ExpenseDto> WithdrawExpenseAsync(string expenseId, string userId);
}

