using Microsoft.EntityFrameworkCore;
using VendorPay.Data;
using VendorPay.DTOs;
using VendorPay.Models;
using System.Text.Json;

namespace VendorPay.Services;

public interface IInvoiceActivityService
{
    Task LogActivityAsync(int invoiceId, InvoiceActivityAction action, int performedById, string performedByUsername, string performedByRole, object? metadata = null);
    Task<IEnumerable<InvoiceActivityReadDto>> GetActivitiesForInvoiceAsync(int invoiceId);
}

public class InvoiceActivityService : IInvoiceActivityService
{
    private readonly AppDbContext _context;
    private readonly ILogger<InvoiceActivityService> _logger;

    public InvoiceActivityService(AppDbContext context, ILogger<InvoiceActivityService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task LogActivityAsync(int invoiceId, InvoiceActivityAction action, int performedById, string performedByUsername, string performedByRole, object? metadata = null)
    {
        var activity = new InvoiceActivity
        {
            InvoiceId = invoiceId,
            Action = action,
            PerformedById = performedById,
            PerformedByUsername = performedByUsername,
            PerformedByRole = performedByRole,
            Metadata = metadata != null ? JsonSerializer.Serialize(metadata) : null,
            Timestamp = DateTime.UtcNow
        };

        _context.InvoiceActivities.Add(activity);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Logged activity {Action} for Invoice {InvoiceId} by {Username}", action, invoiceId, performedByUsername);
    }

    public async Task<IEnumerable<InvoiceActivityReadDto>> GetActivitiesForInvoiceAsync(int invoiceId)
    {
        var activities = await _context.InvoiceActivities
            .Where(a => a.InvoiceId == invoiceId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();

        return activities.Select(a => new InvoiceActivityReadDto
        {
            Id = a.Id,
            InvoiceId = a.InvoiceId,
            Action = a.Action.ToString(),
            PerformedById = a.PerformedById,
            PerformedByUsername = a.PerformedByUsername,
            PerformedByRole = a.PerformedByRole,
            Metadata = a.Metadata,
            Timestamp = a.Timestamp
        });
    }
}
