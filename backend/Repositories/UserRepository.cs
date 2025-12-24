using MongoDB.Driver;
using ExpenseFlow.Models.Entities;
using ExpenseFlow.Services;

namespace ExpenseFlow.Repositories;

/// <summary>
/// Repository implementation for User entity operations
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _collection;

    public UserRepository(IMongoService mongoService)
    {
        _collection = mongoService.Users;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, email.ToLowerInvariant());
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        // Normalize email to lowercase
        user.Email = user.Email.ToLowerInvariant();
        await _collection.InsertOneAsync(user);
        return user;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        var filter = Builders<User>.Filter.Eq(u => u.Email, email.ToLowerInvariant());
        var count = await _collection.CountDocumentsAsync(filter);
        return count > 0;
    }
}

