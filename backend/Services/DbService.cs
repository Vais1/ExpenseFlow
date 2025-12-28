using System.Data;
using Dapper;
using Npgsql;

namespace ExpenseFlow.Services;

public class DbService : IDbService
{
    private readonly string _connectionString;
    private readonly ILogger<DbService> _logger;

    public DbService(IConfiguration configuration, ILogger<DbService> logger)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        _logger = logger;
    }

    public IDbConnection CreateConnection()
    {
        return new NpgsqlConnection(_connectionString);
    }

    public async Task InitDatabaseAsync()
    {
        using var connection = CreateConnection();
        
        try 
        {
            _logger.LogInformation("Initializing database schema...");

            // Create Users table
            var createUsersSql = @"
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    full_name VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );";

            // Create Expenses table
            var createExpensesSql = @"
                CREATE TABLE IF NOT EXISTS expenses (
                    id UUID PRIMARY KEY,
                    user_id UUID NOT NULL,
                    amount DECIMAL(18,2) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    date_incurred TIMESTAMP NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    rejection_reason TEXT,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id)
                );
                
                CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
                CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
            ";

            await connection.ExecuteAsync(createUsersSql);
            await connection.ExecuteAsync(createExpensesSql);

            _logger.LogInformation("Database schema initialized successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing database schema");
            throw;
        }
    }
}
