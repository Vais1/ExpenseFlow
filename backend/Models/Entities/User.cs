using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Models.Entities;

/// <summary>
/// User entity representing a system user
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// User's email address (unique identifier for login)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password for authentication
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// User's role in the system
    /// </summary>
    public UserRole Role { get; set; } = UserRole.Employee;

    /// <summary>
    /// User's full name
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the user was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
