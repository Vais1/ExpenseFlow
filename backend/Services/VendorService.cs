using Microsoft.EntityFrameworkCore;
using VendorPay.DTOs;
using VendorPay.Models;
using VendorPay.Repositories;

namespace VendorPay.Services;

public interface IVendorService
{
    Task<IEnumerable<VendorReadDto>> GetAllVendorsAsync(bool activeOnly = false);
    Task<VendorReadDto?> GetVendorByIdAsync(int id);
    Task<VendorReadDto> CreateVendorAsync(VendorCreateDto createDto);
    Task<VendorReadDto?> UpdateVendorAsync(int id, VendorUpdateDto updateDto);
    Task<bool> DeleteVendorAsync(int id);
}

public class VendorService : IVendorService
{
    private readonly IRepository<Vendor> _vendorRepository;
    private readonly AppDbContext _context;
    private readonly ILogger<VendorService> _logger;

    public VendorService(IRepository<Vendor> vendorRepository, AppDbContext context, ILogger<VendorService> logger)
    {
        _vendorRepository = vendorRepository;
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<VendorReadDto>> GetAllVendorsAsync(bool activeOnly = false)
    {
        IQueryable<Vendor> query = _context.Vendors.Where(v => !v.IsDeleted);
        
        if (activeOnly)
        {
            query = query.Where(v => v.Status == VendorStatus.Active);
        }

        var vendors = await query.OrderBy(v => v.Name).ToListAsync();
        return vendors.Select(MapToReadDto);
    }

    public async Task<VendorReadDto?> GetVendorByIdAsync(int id)
    {
        var vendor = await _context.Vendors.FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);
        return vendor == null ? null : MapToReadDto(vendor);
    }

    public async Task<VendorReadDto> CreateVendorAsync(VendorCreateDto createDto)
    {
        var vendor = new Vendor
        {
            Name = createDto.Name,
            Category = createDto.Category,
            Status = VendorStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _vendorRepository.AddAsync(vendor);
        await _vendorRepository.SaveChangesAsync();

        _logger.LogInformation("Vendor {VendorName} created with ID {VendorId}", vendor.Name, vendor.Id);

        return MapToReadDto(vendor);
    }

    public async Task<VendorReadDto?> UpdateVendorAsync(int id, VendorUpdateDto updateDto)
    {
        var vendor = await _context.Vendors.FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);
        if (vendor == null)
        {
            _logger.LogWarning("Vendor with ID {VendorId} not found for update", id);
            return null;
        }

        vendor.Name = updateDto.Name;
        vendor.Category = updateDto.Category;
        vendor.UpdatedAt = DateTime.UtcNow;

        // Update status if provided
        if (updateDto.Status.HasValue)
        {
            vendor.Status = updateDto.Status.Value;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Vendor {VendorId} updated successfully", id);

        return MapToReadDto(vendor);
    }

    public async Task<bool> DeleteVendorAsync(int id)
    {
        var vendor = await _context.Vendors.FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);
        if (vendor == null)
        {
            _logger.LogWarning("Vendor with ID {VendorId} not found for deletion", id);
            return false;
        }

        // Soft delete instead of hard delete
        vendor.IsDeleted = true;
        vendor.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Vendor {VendorId} soft-deleted successfully", id);

        return true;
    }

    private static VendorReadDto MapToReadDto(Vendor vendor)
    {
        return new VendorReadDto
        {
            Id = vendor.Id,
            Name = vendor.Name,
            Category = vendor.Category,
            Status = vendor.Status.ToString(),
            CreatedAt = vendor.CreatedAt,
            UpdatedAt = vendor.UpdatedAt
        };
    }
}

