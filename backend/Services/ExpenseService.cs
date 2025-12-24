using ExpenseFlow.Models.DTOs;
using ExpenseFlow.Models.Entities;
using ExpenseFlow.Models.Enums;
using ExpenseFlow.Repositories;

namespace ExpenseFlow.Services;

/// <summary>
/// Service implementation for expense operations
/// </summary>
public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly ILogger<ExpenseService> _logger;

    public ExpenseService(
        IExpenseRepository expenseRepository,
        ILogger<ExpenseService> logger)
    {
        _expenseRepository = expenseRepository;
        _logger = logger;
    }

    public async Task<ExpenseDto> SubmitExpenseAsync(CreateExpenseDto dto, string userId)
    {
        // Validate business rules
        if (dto.Amount <= 0)
        {
            throw new ArgumentException("Amount must be greater than zero", nameof(dto));
        }

        if (dto.DateIncurred > DateTime.UtcNow)
        {
            throw new ArgumentException("Date incurred cannot be in the future", nameof(dto));
        }

        var expense = new Expense
        {
            UserId = userId,
            Amount = dto.Amount,
            Category = dto.Category,
            Description = dto.Description,
            DateIncurred = dto.DateIncurred,
            Status = ExpenseStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        var createdExpense = await _expenseRepository.CreateAsync(expense);
        _logger.LogInformation("Expense {ExpenseId} created by user {UserId}", createdExpense.Id, userId);

        return MapToDto(createdExpense);
    }

    public async Task<IEnumerable<ExpenseDto>> GetMyExpensesAsync(string userId)
    {
        var expenses = await _expenseRepository.GetByUserIdAsync(userId);
        return expenses.Select(MapToDto);
    }

    public async Task<IEnumerable<ExpenseDto>> GetPendingApprovalsAsync()
    {
        var expenses = await _expenseRepository.GetByStatusAsync(ExpenseStatus.Pending);
        return expenses.Select(MapToDto);
    }

    public async Task<ExpenseDto> UpdateExpenseStatusAsync(string expenseId, ExpenseStatus newStatus, string? reason)
    {
        var expense = await _expenseRepository.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new KeyNotFoundException($"Expense with ID {expenseId} not found");
        }

        // Validate status transition
        if (expense.Status == ExpenseStatus.Approved && newStatus == ExpenseStatus.Pending)
        {
            throw new InvalidOperationException("Cannot change approved expense back to pending");
        }

        expense.Status = newStatus;

        // Set rejection reason if status is Rejected
        if (newStatus == ExpenseStatus.Rejected)
        {
            expense.RejectionReason = reason ?? "No reason provided";
        }
        else
        {
            expense.RejectionReason = null;
        }

        var updatedExpense = await _expenseRepository.UpdateAsync(expense);
        _logger.LogInformation(
            "Expense {ExpenseId} status updated to {Status}",
            updatedExpense.Id,
            newStatus);

        return MapToDto(updatedExpense);
    }

    public async Task<ExpenseDto> UpdateExpenseAsync(string expenseId, string userId, CreateExpenseDto dto)
    {
        var expense = await _expenseRepository.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new KeyNotFoundException($"Expense with ID {expenseId} not found");
        }

        // Only the owner can update their expense
        if (expense.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only update your own expenses");
        }

        // Only pending expenses can be updated
        if (expense.Status != ExpenseStatus.Pending)
        {
            throw new InvalidOperationException("Only pending expenses can be updated");
        }

        // Validate business rules
        if (dto.Amount <= 0)
        {
            throw new ArgumentException("Amount must be greater than zero", nameof(dto));
        }

        if (dto.DateIncurred > DateTime.UtcNow)
        {
            throw new ArgumentException("Date incurred cannot be in the future", nameof(dto));
        }

        // Update expense fields
        expense.Amount = dto.Amount;
        expense.Category = dto.Category;
        expense.Description = dto.Description;
        expense.DateIncurred = dto.DateIncurred;

        var updatedExpense = await _expenseRepository.UpdateAsync(expense);
        _logger.LogInformation("Expense {ExpenseId} updated by user {UserId}", updatedExpense.Id, userId);

        return MapToDto(updatedExpense);
    }

    public async Task<ExpenseDto> WithdrawExpenseAsync(string expenseId, string userId)
    {
        var expense = await _expenseRepository.GetByIdAsync(expenseId);
        if (expense is null)
        {
            throw new KeyNotFoundException($"Expense with ID {expenseId} not found");
        }

        // Only the owner can withdraw their expense
        if (expense.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only withdraw your own expenses");
        }

        // Only pending expenses can be withdrawn
        if (expense.Status != ExpenseStatus.Pending)
        {
            throw new InvalidOperationException("Only pending expenses can be withdrawn");
        }

        expense.Status = ExpenseStatus.Withdrawn;
        var updatedExpense = await _expenseRepository.UpdateAsync(expense);
        _logger.LogInformation("Expense {ExpenseId} withdrawn by user {UserId}", updatedExpense.Id, userId);

        return MapToDto(updatedExpense);
    }

    private static ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            UserId = expense.UserId,
            Amount = expense.Amount,
            Category = expense.Category,
            Description = expense.Description,
            DateIncurred = expense.DateIncurred,
            Status = expense.Status,
            RejectionReason = expense.RejectionReason,
            CreatedAt = expense.CreatedAt
        };
    }
}

