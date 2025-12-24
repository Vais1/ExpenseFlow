using MongoDB.Driver;
using ExpenseFlow.Models.Entities;

namespace ExpenseFlow.Services;

/// <summary>
/// Service interface for MongoDB collection access
/// </summary>
public interface IMongoService
{
    /// <summary>
    /// Get the Users collection
    /// </summary>
    IMongoCollection<User> Users { get; }

    /// <summary>
    /// Get the Expenses collection
    /// </summary>
    IMongoCollection<Expense> Expenses { get; }

    /// <summary>
    /// Get a collection by name (generic access)
    /// </summary>
    IMongoCollection<T> GetCollection<T>(string collectionName);
}

