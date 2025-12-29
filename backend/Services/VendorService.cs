using VendorPay.DTOs;
using VendorPay.Models;
using VendorPay.Repositories;

namespace VendorPay.Services;

public interface IVendorService
{
    Task<IEnumerable<VendorReadDto>> GetAllVendorsAsync();
    Task<VendorReadDto?> GetVendorByIdAsync(int id);
    Task<VendorReadDto> CreateVendorAsync(VendorCreateDto createDto);
    Task<VendorReadDto?> UpdateVendorAsync(int id, VendorUpdateDto updateDto);
    Task<bool> DeleteVendorAsync(int id);
}

public class VendorService : IVendorService
{
    private readonly IRepository<Vendor> _vendorRepository;
    private readonly ILogger<VendorService> _logger;

    public VendorService(IRepository<Vendor> vendorRepository, ILogger<VendorService> logger)
    {
        _vendorRepository = vendorRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<VendorReadDto>> GetAllVendorsAsync()
    {
        var vendors = await _vendorRepository.GetAllAsync();
        return vendors.Select(MapToReadDto);
    }

    public async Task<VendorReadDto?> GetVendorByIdAsync(int id)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);
        return vendor == null ? null : MapToReadDto(vendor);
    }

    public async Task<VendorReadDto> CreateVendorAsync(VendorCreateDto createDto)
    {
        var vendor = new Vendor
        {
            Name = createDto.Name,
            Category = createDto.Category,
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
        var vendor = await _vendorRepository.GetByIdAsync(id);
        if (vendor == null)
        {
            _logger.LogWarning("Vendor with ID {VendorId} not found for update", id);
            return null;
        }

        vendor.Name = updateDto.Name;
        vendor.Category = updateDto.Category;
        vendor.UpdatedAt = DateTime.UtcNow;

        await _vendorRepository.UpdateAsync(vendor);
        await _vendorRepository.SaveChangesAsync();

        _logger.LogInformation("Vendor {VendorId} updated successfully", id);

        return MapToReadDto(vendor);
    }

    public async Task<bool> DeleteVendorAsync(int id)
    {
        var vendor = await _vendorRepository.GetByIdAsync(id);
        if (vendor == null)
        {
            _logger.LogWarning("Vendor with ID {VendorId} not found for deletion", id);
            return false;
        }

        // Check if vendor has associated invoices
        var hasInvoices = await _vendorRepository.AnyAsync(v => v.Id == id && v.Invoices.Any());
        if (hasInvoices)
        {
            _logger.LogWarning("Cannot delete vendor {VendorId} - has associated invoices", id);
            throw new InvalidOperationException("Cannot delete vendor with existing invoices");
        }

        await _vendorRepository.DeleteAsync(vendor);
        await _vendorRepository.SaveChangesAsync();

        _logger.LogInformation("Vendor {VendorId} deleted successfully", id);

        return true;
    }

    private static VendorReadDto MapToReadDto(Vendor vendor)
    {
        return new VendorReadDto
        {
            Id = vendor.Id,
            Name = vendor.Name,
            Category = vendor.Category,
            CreatedAt = vendor.CreatedAt,
            UpdatedAt = vendor.UpdatedAt
        };
    }
}
