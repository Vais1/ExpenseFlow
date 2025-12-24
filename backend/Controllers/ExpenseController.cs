using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ExpenseFlow.Models.DTOs;
using ExpenseFlow.Models.Enums;
using ExpenseFlow.Services;

namespace ExpenseFlow.Controllers;

/// <summary>
/// Controller for expense-related operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpenseController : ControllerBase
{
    private readonly IExpenseService _expenseService;
    private readonly ILogger<ExpenseController> _logger;

    public ExpenseController(
        IExpenseService expenseService,
        ILogger<ExpenseController> logger)
    {
        _expenseService = expenseService;
        _logger = logger;
    }

    /// <summary>
    /// Submit a new expense claim
    /// </summary>
    /// <param name="request">Expense details</param>
    /// <returns>Created expense</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ExpenseDto>> SubmitExpense([FromBody] CreateExpenseDto request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User ID not found in token" });
        }

        try
        {
            var expense = await _expenseService.SubmitExpenseAsync(request, userId);
            return CreatedAtAction(
                nameof(GetMyExpenses),
                new { },
                expense);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid expense data submitted by user {UserId}", userId);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting expense for user {UserId}", userId);
            return StatusCode(500, new { error = "An error occurred while submitting the expense" });
        }
    }

    /// <summary>
    /// Get current user's expense history
    /// </summary>
    /// <returns>List of user's expenses</returns>
    [HttpGet("my-history")]
    [ProducesResponseType(typeof(IEnumerable<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetMyExpenses()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User ID not found in token" });
        }

        try
        {
            var expenses = await _expenseService.GetMyExpensesAsync(userId);
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expenses for user {UserId}", userId);
            return StatusCode(500, new { error = "An error occurred while retrieving expenses" });
        }
    }

    /// <summary>
    /// Get all pending expense approvals (Manager only)
    /// </summary>
    /// <returns>List of pending expenses</returns>
    [HttpGet("pending")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(typeof(IEnumerable<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetPendingApprovals()
    {
        try
        {
            var expenses = await _expenseService.GetPendingApprovalsAsync();
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approvals");
            return StatusCode(500, new { error = "An error occurred while retrieving pending approvals" });
        }
    }

    /// <summary>
    /// Update the status of an expense (Manager only)
    /// </summary>
    /// <param name="id">Expense ID</param>
    /// <param name="request">Status update details</param>
    /// <returns>Updated expense</returns>
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Manager")]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ExpenseDto>> UpdateExpenseStatus(
        [FromRoute] string id,
        [FromBody] UpdateExpenseStatusDto request)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return BadRequest(new { error = "Expense ID is required" });
        }

        // Validate that reason is provided when rejecting
        if (request.Status == ExpenseStatus.Rejected && string.IsNullOrWhiteSpace(request.Reason))
        {
            return BadRequest(new { error = "Rejection reason is required when rejecting an expense" });
        }

        try
        {
            var expense = await _expenseService.UpdateExpenseStatusAsync(id, request.Status, request.Reason);
            return Ok(expense);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Expense with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid status update attempt for expense {ExpenseId}", id);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for expense {ExpenseId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the expense status" });
        }
    }

    /// <summary>
    /// Update an expense (only for pending expenses by the owner)
    /// </summary>
    /// <param name="id">Expense ID</param>
    /// <param name="request">Updated expense details</param>
    /// <returns>Updated expense</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(
        [FromRoute] string id,
        [FromBody] CreateExpenseDto request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User ID not found in token" });
        }

        try
        {
            var expense = await _expenseService.UpdateExpenseAsync(id, userId, request);
            return Ok(expense);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Expense with ID {id} not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized update attempt for expense {ExpenseId} by user {UserId}", id, userId);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid update attempt for expense {ExpenseId} by user {UserId}", id, userId);
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid expense data for update by user {UserId}", userId);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating expense {ExpenseId} for user {UserId}", id, userId);
            return StatusCode(500, new { error = "An error occurred while updating the expense" });
        }
    }

    /// <summary>
    /// Withdraw an expense (only for pending expenses by the owner)
    /// </summary>
    /// <param name="id">Expense ID</param>
    /// <returns>Withdrawn expense</returns>
    [HttpPatch("{id}/withdraw")]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ExpenseDto>> WithdrawExpense([FromRoute] string id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User ID not found in token" });
        }

        try
        {
            var expense = await _expenseService.WithdrawExpenseAsync(id, userId);
            return Ok(expense);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = $"Expense with ID {id} not found" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized withdraw attempt for expense {ExpenseId} by user {UserId}", id, userId);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid withdraw attempt for expense {ExpenseId} by user {UserId}", id, userId);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error withdrawing expense {ExpenseId} for user {UserId}", id, userId);
            return StatusCode(500, new { error = "An error occurred while withdrawing the expense" });
        }
    }

    /// <summary>
    /// Extract user ID from JWT claims
    /// </summary>
    private string? GetUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}

