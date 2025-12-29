using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VendorPay.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Health check should be public
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Check if the API is alive and responsive
    /// </summary>
    /// <returns>A simple status message</returns>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult Check()
    {
        _logger.LogInformation("Health check performed at {Time}", DateTime.UtcNow);
        
        return Ok(new
        {
            status = "Healthy",
            message = "VendorPay API is up and running",
            timestamp = DateTime.UtcNow,
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            version = "1.0.0"
        });
    }

    /// <summary>
    /// Check database connectivity (Basic)
    /// </summary>
    [HttpGet("ready")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Ready([FromServices] AppDbContext context)
    {
        try
        {
            // Simple query to check if DB is reachable
            var canConnect = await context.Database.CanConnectAsync();
            
            if (canConnect)
            {
                return Ok(new
                {
                    status = "Ready",
                    database = "Connected",
                    timestamp = DateTime.UtcNow
                });
            }
            
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "Unhealthy",
                database = "Disconnected",
                message = "Could not connect to database"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database readiness check failed");
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "Unhealthy",
                database = "Error",
                message = ex.Message
            });
        }
    }
}
