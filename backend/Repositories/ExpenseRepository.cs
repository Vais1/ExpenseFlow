using Dapper;
using ExpenseFlow.Models.Entities;
using ExpenseFlow.Models.Enums;
using ExpenseFlow.Services;

namespace ExpenseFlow.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly IDbService _dbService;

    public ExpenseRepository(IDbService dbService)
    {
        _dbService = dbService;
    }

    public async Task<Expense> CreateAsync(Expense expense)
    {
        using var connection = _dbService.CreateConnection();
        var sql = @"
            INSERT INTO expenses (
                id, user_id, amount, category, description, date_incurred, 
                status, rejection_reason, created_at
            )
            VALUES (
                @Id, @UserId, @Amount, @Category, @Description, @DateIncurred, 
                @Status, @RejectionReason, @CreatedAt
            )";

        var parameters = new
        {
            expense.Id,
            expense.UserId,
            expense.Amount,
            expense.Category,
            expense.Description,
            expense.DateIncurred,
            Status = expense.Status.ToString(),
            expense.RejectionReason,
            expense.CreatedAt
        };

        await connection.ExecuteAsync(sql, parameters);
        return expense;
    }

    public async Task<IEnumerable<Expense>> GetByUserIdAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid)) return Enumerable.Empty<Expense>();

        using var connection = _dbService.CreateConnection();
        var sql = "SELECT * FROM expenses WHERE user_id = @UserId ORDER BY created_at DESC";
        
        // Use custom mapping for Enums if strictly stored as strings
        var result = await connection.QueryAsync<Expense>(sql, new { UserId = userGuid });
        return result; 
    }

    public async Task<IEnumerable<Expense>> GetByStatusAsync(ExpenseStatus status)
    {
        using var connection = _dbService.CreateConnection();
        var sql = "SELECT * FROM expenses WHERE status = @Status ORDER BY created_at ASC";
        return await connection.QueryAsync<Expense>(sql, new { Status = status.ToString() });
    }

    public async Task<Expense?> GetByIdAsync(string id)
    {
        if (!Guid.TryParse(id, out var guid)) return null;

        using var connection = _dbService.CreateConnection();
        var sql = "SELECT * FROM expenses WHERE id = @Id";
        return await connection.QueryFirstOrDefaultAsync<Expense>(sql, new { Id = guid });
    }

    public async Task<Expense> UpdateAsync(Expense expense)
    {
        using var connection = _dbService.CreateConnection();
        var sql = @"
            UPDATE expenses 
            SET amount = @Amount,
                category = @Category,
                description = @Description,
                date_incurred = @DateIncurred,
                status = @Status,
                rejection_reason = @RejectionReason
            WHERE id = @Id";

        var parameters = new
        {
            expense.Id,
            expense.Amount,
            expense.Category,
            expense.Description,
            expense.DateIncurred,
            Status = expense.Status.ToString(),
            expense.RejectionReason
        };

        await connection.ExecuteAsync(sql, parameters);
        return expense;
    }
}
