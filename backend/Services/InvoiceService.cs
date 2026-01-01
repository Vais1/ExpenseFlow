using Microsoft.EntityFrameworkCore;
using VendorPay.Data;
using VendorPay.DTOs;
using VendorPay.Models;
using VendorPay.Repositories;

namespace VendorPay.Services;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceReadDto>> GetInvoicesAsync(
        int currentUserId, 
        string currentUserRole, 
        InvoiceStatus? status = null, 
        string? sortBy = null, 
        string? sortOrder = null,
        string? search = null,
        DateTime? fromDate = null,
        DateTime? toDate = null);
    Task<InvoiceReadDto?> GetInvoiceByIdAsync(int id, int currentUserId, string currentUserRole);
    Task<(InvoiceReadDto Invoice, int InvoiceId)> CreateInvoiceAsync(InvoiceCreateDto createDto, int currentUserId, string currentUserRole, string currentUsername);
    Task<InvoiceReadDto?> UpdateInvoiceStatusAsync(int id, InvoiceUpdateStatusDto updateDto, int currentUserId, string currentUserRole, string currentUsername);
    Task<bool> DeleteInvoiceAsync(int id, int currentUserId, string currentUserRole, string currentUsername);
}

public class InvoiceService : IInvoiceService
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<Vendor> _vendorRepository;
    private readonly AppDbContext _context;
    private readonly IInvoiceActivityService _activityService;
    private readonly ILogger<InvoiceService> _logger;

    public InvoiceService(
        IRepository<Invoice> invoiceRepository,
        IRepository<Vendor> vendorRepository,
        AppDbContext context,
        IInvoiceActivityService activityService,
        ILogger<InvoiceService> logger)
    {
        _invoiceRepository = invoiceRepository;
        _vendorRepository = vendorRepository;
        _context = context;
        _activityService = activityService;
        _logger = logger;
    }

    public async Task<IEnumerable<InvoiceReadDto>> GetInvoicesAsync(
        int currentUserId, 
        string currentUserRole, 
        InvoiceStatus? status = null, 
        string? sortBy = null, 
        string? sortOrder = null,
        string? search = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        IQueryable<Invoice> query = _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .Where(i => !i.IsDeleted);

        // Role-based filtering
        if (currentUserRole == UserRole.User.ToString())
        {
            query = query.Where(i => i.UserId == currentUserId);
        }

        // Status filtering
        if (status.HasValue)
        {
            query = query.Where(i => i.Status == status.Value);
        }

        // Search filtering (vendor name or username)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(i => 
                i.Vendor.Name.ToLower().Contains(searchLower) ||
                i.User.Username.ToLower().Contains(searchLower) ||
                i.Description.ToLower().Contains(searchLower));
        }

        // Date range filtering
        if (fromDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt >= fromDate.Value);
        }
        if (toDate.HasValue)
        {
            query = query.Where(i => i.CreatedAt <= toDate.Value.AddDays(1));
        }

        // Sorting
        var sortOrderDesc = string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase);
        query = sortBy?.ToLower() switch
        {
            "amount" => sortOrderDesc ? query.OrderByDescending(i => i.Amount) : query.OrderBy(i => i.Amount),
            "status" => sortOrderDesc ? query.OrderByDescending(i => i.Status) : query.OrderBy(i => i.Status),
            "vendor" => sortOrderDesc ? query.OrderByDescending(i => i.Vendor.Name) : query.OrderBy(i => i.Vendor.Name),
            "user" => sortOrderDesc ? query.OrderByDescending(i => i.User.Username) : query.OrderBy(i => i.User.Username),
            _ => query.OrderByDescending(i => i.CreatedAt)
        };

        var invoices = await query.ToListAsync();
        return invoices.Select(MapToReadDto);
    }

    public async Task<InvoiceReadDto?> GetInvoiceByIdAsync(int id, int currentUserId, string currentUserRole)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);

        if (invoice == null)
        {
            return null;
        }

        // Role-based access
        if (currentUserRole == UserRole.User.ToString() && invoice.UserId != currentUserId)
        {
            return null;
        }

        return MapToReadDto(invoice);
    }

    public async Task<(InvoiceReadDto Invoice, int InvoiceId)> CreateInvoiceAsync(InvoiceCreateDto createDto, int currentUserId, string currentUserRole, string currentUsername)
    {
        int finalVendorId;

        if (createDto.VendorId.HasValue && createDto.VendorId.Value > 0)
        {
            var vendor = await _context.Vendors
                .FirstOrDefaultAsync(v => v.Id == createDto.VendorId.Value && !v.IsDeleted && v.Status == VendorStatus.Active);
            if (vendor == null)
            {
                throw new InvalidOperationException($"Vendor with ID {createDto.VendorId} not found or is inactive");
            }
            finalVendorId = vendor.Id;
        }
        else if (!string.IsNullOrWhiteSpace(createDto.VendorName))
        {
            var vendorName = createDto.VendorName.Trim();
            var existingVendor = await _context.Vendors
                .FirstOrDefaultAsync(v => v.Name.ToLower() == vendorName.ToLower() && !v.IsDeleted && v.Status == VendorStatus.Active);

            if (existingVendor != null)
            {
                finalVendorId = existingVendor.Id;
            }
            else
            {
                var newVendor = new Vendor
                {
                    Name = vendorName,
                    Category = "Uncategorized",
                    Status = VendorStatus.Active,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                await _vendorRepository.AddAsync(newVendor);
                await _vendorRepository.SaveChangesAsync();
                finalVendorId = newVendor.Id;
            }
        }
        else
        {
            throw new ArgumentException("Either VendorId or VendorName must be provided.");
        }

        var invoice = new Invoice
        {
            Amount = createDto.Amount,
            Description = createDto.Description,
            VendorId = finalVendorId,
            UserId = currentUserId,
            Status = InvoiceStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _invoiceRepository.AddAsync(invoice);
        await _invoiceRepository.SaveChangesAsync();

        // Log activity
        await _activityService.LogActivityAsync(
            invoice.Id,
            InvoiceActivityAction.Created,
            currentUserId,
            currentUsername,
            currentUserRole,
            new { amount = createDto.Amount, description = createDto.Description }
        );

        var createdInvoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == invoice.Id);

        return (MapToReadDto(createdInvoice!), invoice.Id);
    }

    public async Task<InvoiceReadDto?> UpdateInvoiceStatusAsync(int id, InvoiceUpdateStatusDto updateDto, int currentUserId, string currentUserRole, string currentUsername)
    {
        // Role check
        if (currentUserRole != UserRole.Management.ToString() && currentUserRole != UserRole.Admin.ToString())
        {
            throw new UnauthorizedAccessException("Only Management and Admin can update invoice status");
        }

        // Validate rejection reason
        if (updateDto.Status == InvoiceStatus.Rejected && string.IsNullOrWhiteSpace(updateDto.RejectionReason))
        {
            throw new ArgumentException("Rejection reason is required when rejecting an invoice");
        }

        var invoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);

        if (invoice == null)
        {
            return null;
        }

        var previousStatus = invoice.Status;
        invoice.Status = updateDto.Status;
        invoice.UpdatedAt = DateTime.UtcNow;

        if (updateDto.Status == InvoiceStatus.Rejected)
        {
            invoice.RejectionReason = updateDto.RejectionReason;
        }
        else
        {
            invoice.RejectionReason = null;
        }

        await _context.SaveChangesAsync();

        // Log activity
        var action = updateDto.Status == InvoiceStatus.Approved 
            ? InvoiceActivityAction.Approved 
            : InvoiceActivityAction.Rejected;
        
        await _activityService.LogActivityAsync(
            id,
            action,
            currentUserId,
            currentUsername,
            currentUserRole,
            new { 
                previousStatus = previousStatus.ToString(), 
                newStatus = updateDto.Status.ToString(),
                rejectionReason = updateDto.RejectionReason
            }
        );

        return MapToReadDto(invoice);
    }

    public async Task<bool> DeleteInvoiceAsync(int id, int currentUserId, string currentUserRole, string currentUsername)
    {
        var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);
        if (invoice == null)
        {
            return false;
        }

        // Users can only delete their own pending invoices
        if (currentUserRole == UserRole.User.ToString())
        {
            if (invoice.UserId != currentUserId)
            {
                throw new UnauthorizedAccessException("You can only delete your own invoices");
            }
            if (invoice.Status != InvoiceStatus.Pending)
            {
                throw new InvalidOperationException("You can only delete pending invoices");
            }
        }

        invoice.IsDeleted = true;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Log activity
        await _activityService.LogActivityAsync(
            id,
            InvoiceActivityAction.Deleted,
            currentUserId,
            currentUsername,
            currentUserRole,
            null
        );

        return true;
    }

    private static InvoiceReadDto MapToReadDto(Invoice invoice)
    {
        return new InvoiceReadDto
        {
            Id = invoice.Id,
            Amount = invoice.Amount,
            Status = invoice.Status.ToString(),
            Description = invoice.Description,
            RejectionReason = invoice.RejectionReason,
            VendorId = invoice.VendorId,
            UserId = invoice.UserId,
            VendorName = invoice.Vendor?.Name ?? string.Empty,
            VendorCategory = invoice.Vendor?.Category ?? string.Empty,
            Username = invoice.User?.Username ?? string.Empty,
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt
        };
    }
}


