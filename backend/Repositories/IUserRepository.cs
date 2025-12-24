using ExpenseFlow.Models.Entities;

namespace ExpenseFlow.Repositories;

/// <summary>
/// Repository interface for User entity operations
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Get user by email address
    /// </summary>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Get user by ID
    /// </summary>
    Task<User?> GetByIdAsync(string id);

    /// <summary>
    /// Create a new user
    /// </summary>
    Task<User> CreateAsync(User user);

    /// <summary>
    /// Check if email already exists
    /// </summary>
    Task<bool> EmailExistsAsync(string email);
}

