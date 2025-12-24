using ExpenseFlow.Models.DTOs;

namespace ExpenseFlow.Services;

/// <summary>
/// Service interface for authentication operations
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticate user and generate JWT token
    /// </summary>
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);

    /// <summary>
    /// Register a new user
    /// </summary>
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
}

