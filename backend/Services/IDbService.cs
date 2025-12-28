using System.Data;

namespace ExpenseFlow.Services;

public interface IDbService
{
    /// <summary>
    /// Creates and returns a new open database connection
    /// </summary>
    IDbConnection CreateConnection();

    /// <summary>
    /// Initializes the database schema if it doesn't exist
    /// </summary>
    Task InitDatabaseAsync();
}
