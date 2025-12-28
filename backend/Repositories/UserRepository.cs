using Dapper;
using ExpenseFlow.Models.Entities;
using ExpenseFlow.Services;

namespace ExpenseFlow.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbService _dbService;

    public UserRepository(IDbService dbService)
    {
        _dbService = dbService;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _dbService.CreateConnection();
        var sql = "SELECT * FROM users WHERE email = @Email";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email.ToLowerInvariant() });
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        if (!Guid.TryParse(id, out var guid)) return null;

        using var connection = _dbService.CreateConnection();
        var sql = "SELECT * FROM users WHERE id = @Id";
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = guid });
    }

    public async Task<User> CreateAsync(User user)
    {
        user.Email = user.Email.ToLowerInvariant();
        
        using var connection = _dbService.CreateConnection();
        var sql = @"
            INSERT INTO users (id, email, password_hash, role, full_name, created_at)
            VALUES (@Id, @Email, @PasswordHash, @Role, @FullName, @CreatedAt)";
        
        // Dapper maps enums to strings automatically if configured, but let's be explicit with .ToString() for the role if needed, 
        // OR rely on Dapper's default Enum handling (usually integer).
        // WARNING: Postgres stores Role as VARCHAR. We must map the Enum to String.
        
        var parameters = new
        {
            user.Id,
            user.Email,
            user.PasswordHash,
            Role = user.Role.ToString(),
            user.FullName,
            user.CreatedAt
        };

        await connection.ExecuteAsync(sql, parameters);
        return user;
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        using var connection = _dbService.CreateConnection();
        var sql = "SELECT COUNT(1) FROM users WHERE email = @Email";
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Email = email.ToLowerInvariant() });
        return count > 0;
    }
}
