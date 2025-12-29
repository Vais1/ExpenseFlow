using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VendorPay.DTOs;
using VendorPay.Services;

namespace VendorPay.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints require authentication
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly ILogger<InvoiceController> _logger;

    public InvoiceController(IInvoiceService invoiceService, ILogger<InvoiceController> logger)
    {
        _invoiceService = invoiceService;
        _logger = logger;
    }

    /// <summary>
    /// Get all invoices (filtered by role: User sees own, Management/Admin see all)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<InvoiceReadDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllInvoices()
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();

            var invoices = await _invoiceService.GetInvoicesAsync(currentUserId, currentUserRole);
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
    /// Get invoice by ID (role-based access control applied)
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
                // Could be not found OR forbidden (user trying to access someone else's invoice)
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
    /// Create a new invoice (User role creates with Pending status)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "User,Management,Admin")]
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
            var invoice = await _invoiceService.CreateInvoiceAsync(createDto, currentUserId);
            
            return CreatedAtAction(nameof(GetInvoiceById), new { id = invoice.Id }, invoice);
        }
        catch (InvalidOperationException ex)
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
    /// Update invoice status (Management and Admin only can Approve/Reject)
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Management,Admin")]
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

            var invoice = await _invoiceService.UpdateInvoiceStatusAsync(id, updateDto, currentUserId, currentUserRole);
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
    /// Delete an invoice (Users can delete their own, Management/Admin can delete any)
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

            var success = await _invoiceService.DeleteInvoiceAsync(id, currentUserId, currentUserRole);
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

    /// <summary>
    /// Extract current user ID from JWT claims
    /// </summary>
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            _logger.LogError("Unable to extract user ID from JWT claims");
            throw new UnauthorizedAccessException("Invalid user authentication");
        }
        return userId;
    }

    /// <summary>
    /// Extract current user role from JWT claims
    /// </summary>
    private string GetCurrentUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(roleClaim))
        {
            _logger.LogError("Unable to extract user role from JWT claims");
            throw new UnauthorizedAccessException("Invalid user authentication");
        }
        return roleClaim;
    }

    #endregion
}
