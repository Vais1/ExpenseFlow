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
    Task<InvoiceReadDto?> UpdateInvoiceAsync(int id, InvoiceUpdateDto updateDto, int currentUserId, string currentUserRole, string currentUsername);
    Task<InvoiceReadDto?> WithdrawInvoiceAsync(int id, int currentUserId, string currentUserRole, string currentUsername);
    Task<InvoiceReadDto?> UpdateInvoiceStatusAsync(int id, InvoiceUpdateStatusDto updateDto, int currentUserId, string currentUserRole, string currentUsername);
    Task<bool> DeleteInvoiceAsync(int id, int currentUserId, string currentUserRole, string currentUsername);
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<int> BulkUpdateStatusAsync(BulkStatusUpdateDto dto, int currentUserId, string currentUserRole, string currentUsername);
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

    /// <summary>
    /// User can edit their own pending invoice
    /// </summary>
    public async Task<InvoiceReadDto?> UpdateInvoiceAsync(int id, InvoiceUpdateDto updateDto, int currentUserId, string currentUserRole, string currentUsername)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);

        if (invoice == null)
        {
            return null;
        }

        // Users can only edit their own invoices
        if (invoice.UserId != currentUserId)
        {
            throw new UnauthorizedAccessException("You can only edit your own invoices");
        }

        // Can only edit pending invoices
        if (invoice.Status != InvoiceStatus.Pending)
        {
            throw new InvalidOperationException("Only pending invoices can be edited");
        }

        // Resolve vendor
        int finalVendorId = invoice.VendorId;
        if (updateDto.VendorId.HasValue && updateDto.VendorId.Value > 0)
        {
            var vendor = await _context.Vendors
                .FirstOrDefaultAsync(v => v.Id == updateDto.VendorId.Value && !v.IsDeleted && v.Status == VendorStatus.Active);
            if (vendor == null)
            {
                throw new InvalidOperationException($"Vendor with ID {updateDto.VendorId} not found or is inactive");
            }
            finalVendorId = vendor.Id;
        }
        else if (!string.IsNullOrWhiteSpace(updateDto.VendorName))
        {
            var vendorName = updateDto.VendorName.Trim();
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

        var previousAmount = invoice.Amount;
        var previousDescription = invoice.Description;

        invoice.Amount = updateDto.Amount;
        invoice.Description = updateDto.Description;
        invoice.VendorId = finalVendorId;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log activity
        await _activityService.LogActivityAsync(
            id,
            InvoiceActivityAction.Updated,
            currentUserId,
            currentUsername,
            currentUserRole,
            new { previousAmount, newAmount = updateDto.Amount, previousDescription, newDescription = updateDto.Description }
        );

        // Reload with navigation properties
        var updatedInvoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id);

        return MapToReadDto(updatedInvoice!);
    }

    /// <summary>
    /// User can withdraw their own pending invoice
    /// </summary>
    public async Task<InvoiceReadDto?> WithdrawInvoiceAsync(int id, int currentUserId, string currentUserRole, string currentUsername)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);

        if (invoice == null)
        {
            return null;
        }

        // Users can only withdraw their own invoices
        if (invoice.UserId != currentUserId)
        {
            throw new UnauthorizedAccessException("You can only withdraw your own invoices");
        }

        // Can only withdraw pending invoices
        if (invoice.Status != InvoiceStatus.Pending)
        {
            throw new InvalidOperationException("Only pending invoices can be withdrawn");
        }

        invoice.Status = InvoiceStatus.Withdrawn;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log activity
        await _activityService.LogActivityAsync(
            id,
            InvoiceActivityAction.Updated,
            currentUserId,
            currentUsername,
            currentUserRole,
            new { action = "Withdrawn", previousStatus = "Pending", newStatus = "Withdrawn" }
        );

        return MapToReadDto(invoice);
    }

    public async Task<InvoiceReadDto?> UpdateInvoiceStatusAsync(int id, InvoiceUpdateStatusDto updateDto, int currentUserId, string currentUserRole, string currentUsername)
    {
        // Role check
        if (currentUserRole != UserRole.Admin.ToString())
        {
            throw new UnauthorizedAccessException("Only Admin can update invoice status");
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

    /// <summary>
    /// Get dashboard statistics (Admin only)
    /// </summary>
    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var invoices = await _context.Invoices
            .Where(i => !i.IsDeleted)
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalInvoices = invoices.Count,
            PendingCount = invoices.Count(i => i.Status == InvoiceStatus.Pending),
            ApprovedCount = invoices.Count(i => i.Status == InvoiceStatus.Approved),
            RejectedCount = invoices.Count(i => i.Status == InvoiceStatus.Rejected),
            WithdrawnCount = invoices.Count(i => i.Status == InvoiceStatus.Withdrawn),
            TotalAmount = invoices.Sum(i => i.Amount),
            PendingAmount = invoices.Where(i => i.Status == InvoiceStatus.Pending).Sum(i => i.Amount),
            ApprovedAmount = invoices.Where(i => i.Status == InvoiceStatus.Approved).Sum(i => i.Amount)
        };
    }

    /// <summary>
    /// Bulk update invoice status (Admin only)
    /// </summary>
    public async Task<int> BulkUpdateStatusAsync(BulkStatusUpdateDto dto, int currentUserId, string currentUserRole, string currentUsername)
    {
        if (currentUserRole != UserRole.Admin.ToString())
        {
            throw new UnauthorizedAccessException("Only Admin can perform bulk status updates");
        }

        if (dto.Status == InvoiceStatus.Rejected && string.IsNullOrWhiteSpace(dto.RejectionReason))
        {
            throw new ArgumentException("Rejection reason is required when rejecting invoices");
        }

        var invoices = await _context.Invoices
            .Where(i => dto.InvoiceIds.Contains(i.Id) && !i.IsDeleted && i.Status == InvoiceStatus.Pending)
            .ToListAsync();

        foreach (var invoice in invoices)
        {
            var previousStatus = invoice.Status;
            invoice.Status = dto.Status;
            invoice.UpdatedAt = DateTime.UtcNow;

            if (dto.Status == InvoiceStatus.Rejected)
            {
                invoice.RejectionReason = dto.RejectionReason;
            }

            // Log activity for each
            var action = dto.Status == InvoiceStatus.Approved
                ? InvoiceActivityAction.Approved
                : InvoiceActivityAction.Rejected;

            await _activityService.LogActivityAsync(
                invoice.Id,
                action,
                currentUserId,
                currentUsername,
                currentUserRole,
                new { previousStatus = previousStatus.ToString(), newStatus = dto.Status.ToString(), bulk = true }
            );
        }

        await _context.SaveChangesAsync();
        return invoices.Count;
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


