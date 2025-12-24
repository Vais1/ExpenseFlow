using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Models.Entities;

/// <summary>
/// User entity representing a system user in MongoDB
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user (MongoDB ObjectId)
    /// </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// User's email address (unique identifier for login)
    /// </summary>
    [BsonElement("email")]
    [BsonRequired]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password for authentication
    /// </summary>
    [BsonElement("passwordHash")]
    [BsonRequired]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// User's role in the system
    /// </summary>
    [BsonElement("role")]
    [BsonRepresentation(BsonType.String)]
    [BsonRequired]
    public UserRole Role { get; set; } = UserRole.Employee;

    /// <summary>
    /// User's full name
    /// </summary>
    [BsonElement("fullName")]
    [BsonRequired]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the user was created
    /// </summary>
    [BsonElement("createdAt")]
    [BsonRequired]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

