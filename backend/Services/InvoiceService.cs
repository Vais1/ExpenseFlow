using Microsoft.EntityFrameworkCore;
using VendorPay.DTOs;
using VendorPay.Models;
using VendorPay.Repositories;

namespace VendorPay.Services;

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceReadDto>> GetInvoicesAsync(int currentUserId, string currentUserRole);
    Task<InvoiceReadDto?> GetInvoiceByIdAsync(int id, int currentUserId, string currentUserRole);
    Task<InvoiceReadDto> CreateInvoiceAsync(InvoiceCreateDto createDto, int currentUserId);
    Task<InvoiceReadDto?> UpdateInvoiceStatusAsync(int id, InvoiceUpdateStatusDto updateDto, int currentUserId, string currentUserRole);
    Task<bool> DeleteInvoiceAsync(int id, int currentUserId, string currentUserRole);
}

public class InvoiceService : IInvoiceService
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<Vendor> _vendorRepository;
    private readonly IRepository<User> _userRepository;
    private readonly AppDbContext _context;
    private readonly ILogger<InvoiceService> _logger;

    public InvoiceService(
        IRepository<Invoice> invoiceRepository,
        IRepository<Vendor> vendorRepository,
        IRepository<User> userRepository,
        AppDbContext context,
        ILogger<InvoiceService> logger)
    {
        _invoiceRepository = invoiceRepository;
        _vendorRepository = vendorRepository;
        _userRepository = userRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<InvoiceReadDto>> GetInvoicesAsync(int currentUserId, string currentUserRole)
    {
        IQueryable<Invoice> query = _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User);

        // Role-based filtering: User sees only their own invoices
        if (currentUserRole == UserRole.User.ToString())
        {
            query = query.Where(i => i.UserId == currentUserId);
            _logger.LogInformation("User {UserId} retrieving their own invoices", currentUserId);
        }
        else
        {
            // Management and Admin see all invoices
            _logger.LogInformation("User {UserId} with role {Role} retrieving all invoices", currentUserId, currentUserRole);
        }

        var invoices = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return invoices.Select(MapToReadDto);
    }

    public async Task<InvoiceReadDto?> GetInvoiceByIdAsync(int id, int currentUserId, string currentUserRole)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            _logger.LogWarning("Invoice {InvoiceId} not found", id);
            return null;
        }

        // Role-based access: User can only see their own invoices
        if (currentUserRole == UserRole.User.ToString() && invoice.UserId != currentUserId)
        {
            _logger.LogWarning("User {UserId} attempted to access invoice {InvoiceId} belonging to another user", currentUserId, id);
            return null; // Return null to indicate forbidden access
        }

        return MapToReadDto(invoice);
    }

    public async Task<InvoiceReadDto> CreateInvoiceAsync(InvoiceCreateDto createDto, int currentUserId)
    {
        int finalVendorId;

        // Logic to handle VendorId or VendorName
        if (createDto.VendorId.HasValue && createDto.VendorId.Value > 0)
        {
            // Case 1: Existing Vendor ID provided
            var vendor = await _vendorRepository.GetByIdAsync(createDto.VendorId.Value);
            if (vendor == null)
            {
                _logger.LogWarning("Vendor {VendorId} not found for invoice creation", createDto.VendorId);
                throw new InvalidOperationException($"Vendor with ID {createDto.VendorId} not found");
            }
            finalVendorId = vendor.Id;
        }
        else if (!string.IsNullOrWhiteSpace(createDto.VendorName))
        {
            // Case 2: Vendor Name provided (Find or Create)
            var vendorName = createDto.VendorName.Trim();
            
            // Try to find existing vendor by name (Case-insensitive check would be ideal, but simple match for now)
            var existingVendor = await _context.Vendors
                .FirstOrDefaultAsync(v => v.Name.ToLower() == vendorName.ToLower());

            if (existingVendor != null)
            {
                finalVendorId = existingVendor.Id;
            }
            else
            {
                // Create new vendor
                var newVendor = new Vendor
                {
                    Name = vendorName,
                    Category = "Uncategorized", // Default category
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                
                await _vendorRepository.AddAsync(newVendor);
                await _vendorRepository.SaveChangesAsync(); // Save to generate ID
                finalVendorId = newVendor.Id;
                
                _logger.LogInformation("Created new vendor '{VendorName}' (ID: {VendorId}) for invoice creation", vendorName, finalVendorId);
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
            Status = InvoiceStatus.Pending, // Always default to Pending
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _invoiceRepository.AddAsync(invoice);
        await _invoiceRepository.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} created by User {UserId}", invoice.Id, currentUserId);

        // Reload with navigation properties
        var createdInvoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == invoice.Id);

        return MapToReadDto(createdInvoice!);
    }

    public async Task<InvoiceReadDto?> UpdateInvoiceStatusAsync(int id, InvoiceUpdateStatusDto updateDto, int currentUserId, string currentUserRole)
    {
        // Only Management role can update status
        if (currentUserRole != UserRole.Management.ToString() && currentUserRole != UserRole.Admin.ToString())
        {
            _logger.LogWarning("User {UserId} with role {Role} attempted to update invoice status - forbidden", currentUserId, currentUserRole);
            throw new UnauthorizedAccessException("Only Management and Admin can update invoice status");
        }

        var invoice = await _context.Invoices
            .Include(i => i.Vendor)
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            _logger.LogWarning("Invoice {InvoiceId} not found for status update", id);
            return null;
        }

        invoice.Status = updateDto.Status;
        invoice.UpdatedAt = DateTime.UtcNow;

        await _invoiceRepository.UpdateAsync(invoice);
        await _invoiceRepository.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} status updated to {Status} by User {UserId}", id, updateDto.Status, currentUserId);

        return MapToReadDto(invoice);
    }

    public async Task<bool> DeleteInvoiceAsync(int id, int currentUserId, string currentUserRole)
    {
        var invoice = await _invoiceRepository.GetByIdAsync(id);
        if (invoice == null)
        {
            _logger.LogWarning("Invoice {InvoiceId} not found for deletion", id);
            return false;
        }

        // Users can only delete their own invoices, Management/Admin can delete any
        if (currentUserRole == UserRole.User.ToString() && invoice.UserId != currentUserId)
        {
            _logger.LogWarning("User {UserId} attempted to delete invoice {InvoiceId} belonging to another user", currentUserId, id);
            throw new UnauthorizedAccessException("You can only delete your own invoices");
        }

        await _invoiceRepository.DeleteAsync(invoice);
        await _invoiceRepository.SaveChangesAsync();

        _logger.LogInformation("Invoice {InvoiceId} deleted by User {UserId}", id, currentUserId);

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
