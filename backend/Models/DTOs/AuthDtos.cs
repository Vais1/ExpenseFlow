using System.ComponentModel.DataAnnotations;
using ExpenseFlow.Models.Enums;

namespace ExpenseFlow.Models.DTOs;

/// <summary>
/// Request DTO for user login
/// </summary>
public record LoginRequestDto
{
    /// <summary>
    /// User's email address
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// User's password
    /// </summary>
    [Required]
    [MinLength(6)]
    public string Password { get; init; } = string.Empty;
}

/// <summary>
/// Request DTO for user registration
/// </summary>
public record RegisterRequestDto
{
    /// <summary>
    /// User's email address
    /// </summary>
    [Required]
    [EmailAddress]
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// User's password
    /// </summary>
    [Required]
    [MinLength(6)]
    public string Password { get; init; } = string.Empty;

    /// <summary>
    /// User's full name
    /// </summary>
    [Required]
    [MinLength(2)]
    public string FullName { get; init; } = string.Empty;

    /// <summary>
    /// User's role (defaults to Employee)
    /// </summary>
    public UserRole Role { get; init; } = UserRole.Employee;
}

/// <summary>
/// Response DTO for authentication operations
/// </summary>
public record AuthResponseDto
{
    /// <summary>
    /// JWT token for authenticated requests
    /// </summary>
    public string Token { get; init; } = string.Empty;

    /// <summary>
    /// User ID
    /// </summary>
    public string UserId { get; init; } = string.Empty;

    /// <summary>
    /// User's email
    /// </summary>
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// User's full name
    /// </summary>
    public string FullName { get; init; } = string.Empty;

    /// <summary>
    /// User's role
    /// </summary>
    public UserRole Role { get; init; }
}

