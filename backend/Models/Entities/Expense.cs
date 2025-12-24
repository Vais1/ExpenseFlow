using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Models.Entities;

/// <summary>
/// Expense entity representing an expense claim in MongoDB
/// </summary>
public class Expense
{
    /// <summary>
    /// Unique identifier for the expense (MongoDB ObjectId)
    /// </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// ID of the user who submitted this expense
    /// </summary>
    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    [BsonRequired]
    public string UserId { get; set; } = string.Empty;

    /// <summary>
    /// Expense amount in the base currency
    /// </summary>
    [BsonElement("amount")]
    [BsonRepresentation(BsonType.Decimal128)]
    [BsonRequired]
    public decimal Amount { get; set; }

    /// <summary>
    /// Category of the expense (e.g., "Travel", "Medical", "Equipment")
    /// </summary>
    [BsonElement("category")]
    [BsonRequired]
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the expense
    /// </summary>
    [BsonElement("description")]
    [BsonRequired]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Date when the expense was incurred
    /// </summary>
    [BsonElement("dateIncurred")]
    [BsonRequired]
    public DateTime DateIncurred { get; set; }

    /// <summary>
    /// Current status of the expense claim
    /// </summary>
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    [BsonRequired]
    public ExpenseStatus Status { get; set; } = ExpenseStatus.Pending;

    /// <summary>
    /// Reason for rejection (only populated when status is Rejected)
    /// </summary>
    [BsonElement("rejectionReason")]
    public string? RejectionReason { get; set; }

    /// <summary>
    /// Timestamp when the expense was created
    /// </summary>
    [BsonElement("createdAt")]
    [BsonRequired]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

