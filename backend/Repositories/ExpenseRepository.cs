using MongoDB.Driver;
using ExpenseFlow.Models.Entities;
using ExpenseFlow.Models.Enums;
using ExpenseFlow.Services;

namespace ExpenseFlow.Repositories;

/// <summary>
/// Repository implementation for Expense entity operations
/// </summary>
public class ExpenseRepository : IExpenseRepository
{
    private readonly IMongoCollection<Expense> _collection;

    public ExpenseRepository(IMongoService mongoService)
    {
        _collection = mongoService.Expenses;
    }

    public async Task<Expense?> GetByIdAsync(string id)
    {
        var filter = Builders<Expense>.Filter.Eq(e => e.Id, id);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Expense>> GetByUserIdAsync(string userId)
    {
        var filter = Builders<Expense>.Filter.Eq(e => e.UserId, userId);
        var sort = Builders<Expense>.Sort.Descending(e => e.CreatedAt);
        return await _collection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<IEnumerable<Expense>> GetByStatusAsync(ExpenseStatus status)
    {
        var filter = Builders<Expense>.Filter.Eq(e => e.Status, status);
        var sort = Builders<Expense>.Sort.Descending(e => e.CreatedAt);
        return await _collection.Find(filter).Sort(sort).ToListAsync();
    }

    public async Task<Expense> CreateAsync(Expense expense)
    {
        await _collection.InsertOneAsync(expense);
        return expense;
    }

    public async Task<Expense> UpdateAsync(Expense expense)
    {
        var filter = Builders<Expense>.Filter.Eq(e => e.Id, expense.Id);
        await _collection.ReplaceOneAsync(filter, expense);
        return expense;
    }
}

