using Microsoft.AspNetCore.Mvc;
using Dapper;
using ExpenseFlow.Services;

namespace ExpenseFlow.Controllers;

/// <summary>
/// Health check controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IDbService _dbService;

    public HealthController(IDbService dbService)
    {
        _dbService = dbService;
    }

    /// <summary>
    /// Health check endpoint with Database connection status
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var healthStatus = new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            service = "ExpenseFlow API",
            database = new
            {
                type = "PostgreSQL",
                connected = false,
                message = ""
            }
        };

        try
        {
            using var connection = _dbService.CreateConnection();
            await connection.ExecuteScalarAsync("SELECT 1");

            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "ExpenseFlow API",
                database = new
                {
                    type = "PostgreSQL",
                    connected = true,
                    message = "Database connection successful"
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new
            {
                status = "unhealthy",
                timestamp = DateTime.UtcNow,
                service = "ExpenseFlow API",
                database = new
                {
                    type = "PostgreSQL",
                    connected = false,
                    message = "Database connection failed",
                    error = ex.Message
                }
            });
        }
    }
}
