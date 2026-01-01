using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VendorPay.DTOs;
using VendorPay.Models;
using VendorPay.Services;

namespace VendorPay.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IInvoiceActivityService _activityService;
    private readonly ILogger<InvoiceController> _logger;

    public InvoiceController(
        IInvoiceService invoiceService, 
        IInvoiceActivityService activityService,
        ILogger<InvoiceController> logger)
    {
        _invoiceService = invoiceService;
        _activityService = activityService;
        _logger = logger;
    }

    /// <summary>
    /// Get all invoices with optional filtering and search
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<InvoiceReadDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllInvoices(
        [FromQuery] int? status = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null,
        [FromQuery] string? search = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            InvoiceStatus? statusEnum = status.HasValue ? (InvoiceStatus)status.Value : null;

            var invoices = await _invoiceService.GetInvoicesAsync(
                currentUserId, 
                currentUserRole, 
                statusEnum, 
                sortBy, 
                sortOrder,
                search,
                fromDate,
                toDate);
            return Ok(invoices);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving invoices");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving invoices"
            });
        }
    }

    /// <summary>
    /// Get invoice by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InvoiceReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvoiceById(int id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var invoice = await _invoiceService.GetInvoiceByIdAsync(id, currentUserId, currentUserRole);
            if (invoice == null)
            {
                return NotFound(new { message = $"Invoice with ID {id} not found or access denied" });
            }

            return Ok(invoice);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving invoice {InvoiceId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving the invoice"
            });
        }
    }

    /// <summary>
    /// Get activity log for an invoice
    /// </summary>
    [HttpGet("{id}/activity")]
    [ProducesResponseType(typeof(IEnumerable<InvoiceActivityReadDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInvoiceActivity(int id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            // First check if user can access this invoice
            var invoice = await _invoiceService.GetInvoiceByIdAsync(id, currentUserId, currentUserRole);
            if (invoice == null)
            {
                return NotFound(new { message = $"Invoice with ID {id} not found or access denied" });
            }

            var activities = await _activityService.GetActivitiesForInvoiceAsync(id);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving activity for invoice {InvoiceId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving invoice activity"
            });
        }
    }

    /// <summary>
    /// Create a new invoice
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "User,Admin")]
    [ProducesResponseType(typeof(InvoiceReadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateInvoice([FromBody] InvoiceCreateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();
            var currentUsername = GetCurrentUsername();

            var (invoice, invoiceId) = await _invoiceService.CreateInvoiceAsync(createDto, currentUserId, currentUserRole, currentUsername);
            
            return CreatedAtAction(nameof(GetInvoiceById), new { id = invoiceId }, invoice);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating invoice");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while creating the invoice"
            });
        }
    }

    /// <summary>
    /// Update invoice status (Admin only)
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(InvoiceReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateInvoiceStatus(int id, [FromBody] InvoiceUpdateStatusDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();
            var currentUsername = GetCurrentUsername();

            var invoice = await _invoiceService.UpdateInvoiceStatusAsync(id, updateDto, currentUserId, currentUserRole, currentUsername);
            if (invoice == null)
            {
                return NotFound(new { message = $"Invoice with ID {id} not found" });
            }

            return Ok(invoice);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating invoice status for {InvoiceId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while updating the invoice status"
            });
        }
    }

    /// <summary>
    /// Delete an invoice (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteInvoice(int id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();
            var currentUsername = GetCurrentUsername();

            var success = await _invoiceService.DeleteInvoiceAsync(id, currentUserId, currentUserRole, currentUsername);
            if (!success)
            {
                return NotFound(new { message = $"Invoice with ID {id} not found" });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting invoice {InvoiceId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while deleting the invoice"
            });
        }
    }

    #region Helper Methods

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user authentication");
        }
        return userId;
    }

    private string GetCurrentUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(roleClaim))
        {
            throw new UnauthorizedAccessException("Invalid user authentication");
        }
        return roleClaim;
    }

    private string GetCurrentUsername()
    {
        var usernameClaim = User.FindFirst(ClaimTypes.Name)?.Value;
        return usernameClaim ?? "Unknown";
    }

    #endregion
}

