using Microsoft.Extensions.Options;
using MongoDB.Driver;
using ExpenseFlow.Configuration;
using ExpenseFlow.Models.Entities;

namespace ExpenseFlow.Services;

/// <summary>
/// Service implementation for MongoDB collection access
/// </summary>
public class MongoService : IMongoService
{
    private readonly IMongoDatabase _database;

    public MongoService(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        _database = mongoClient.GetDatabase(settings.Value.DatabaseName);
    }

    /// <summary>
    /// Get the Users collection
    /// </summary>
    public IMongoCollection<User> Users => _database.GetCollection<User>("users");

    /// <summary>
    /// Get the Expenses collection
    /// </summary>
    public IMongoCollection<Expense> Expenses => _database.GetCollection<Expense>("expenses");

    /// <summary>
    /// Get a collection by name (generic access)
    /// </summary>
    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }
}

