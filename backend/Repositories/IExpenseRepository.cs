using ExpenseFlow.Models.Entities;
using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Repositories;

/// <summary>
/// Repository interface for Expense entity operations
/// </summary>
public interface IExpenseRepository
{
    /// <summary>
    /// Get expense by ID
    /// </summary>
    Task<Expense?> GetByIdAsync(string id);

    /// <summary>
    /// Get all expenses for a specific user
    /// </summary>
    Task<IEnumerable<Expense>> GetByUserIdAsync(string userId);

    /// <summary>
    /// Get all expenses with a specific status
    /// </summary>
    Task<IEnumerable<Expense>> GetByStatusAsync(ExpenseStatus status);

    /// <summary>
    /// Create a new expense
    /// </summary>
    Task<Expense> CreateAsync(Expense expense);

    /// <summary>
    /// Update an existing expense
    /// </summary>
    Task<Expense> UpdateAsync(Expense expense);
}

