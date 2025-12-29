using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VendorPay.DTOs;
using VendorPay.Services;

namespace VendorPay.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All endpoints require authentication
public class VendorController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly ILogger<VendorController> _logger;

    public VendorController(IVendorService vendorService, ILogger<VendorController> logger)
    {
        _vendorService = vendorService;
        _logger = logger;
    }

    /// <summary>
    /// Get all vendors (All authenticated users can access)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<VendorReadDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllVendors()
    {
        try
        {
            var vendors = await _vendorService.GetAllVendorsAsync();
            return Ok(vendors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving vendors");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving vendors"
            });
        }
    }

    /// <summary>
    /// Get vendor by ID (All authenticated users can access)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(VendorReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVendorById(int id)
    {
        try
        {
            var vendor = await _vendorService.GetVendorByIdAsync(id);
            if (vendor == null)
            {
                return NotFound(new { message = $"Vendor with ID {id} not found" });
            }

            return Ok(vendor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving vendor {VendorId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while retrieving the vendor"
            });
        }
    }

    /// <summary>
    /// Create a new vendor (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(VendorReadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateVendor([FromBody] VendorCreateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var vendor = await _vendorService.CreateVendorAsync(createDto);
            return CreatedAtAction(nameof(GetVendorById), new { id = vendor.Id }, vendor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating vendor");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while creating the vendor"
            });
        }
    }

    /// <summary>
    /// Update an existing vendor (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(VendorReadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVendor(int id, [FromBody] VendorUpdateDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var vendor = await _vendorService.UpdateVendorAsync(id, updateDto);
            if (vendor == null)
            {
                return NotFound(new { message = $"Vendor with ID {id} not found" });
            }

            return Ok(vendor);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating vendor {VendorId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while updating the vendor"
            });
        }
    }

    /// <summary>
    /// Delete a vendor (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVendor(int id)
    {
        try
        {
            var success = await _vendorService.DeleteVendorAsync(id);
            if (!success)
            {
                return NotFound(new { message = $"Vendor with ID {id} not found" });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting vendor {VendorId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while deleting the vendor"
            });
        }
    }
}
