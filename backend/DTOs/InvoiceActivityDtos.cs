namespace VendorPay.DTOs;

public class InvoiceActivityReadDto
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public string Action { get; set; } = string.Empty;
    public int PerformedById { get; set; }
    public string PerformedByUsername { get; set; } = string.Empty;
    public string PerformedByRole { get; set; } = string.Empty;
    public string? Metadata { get; set; }
    public DateTime Timestamp { get; set; }
}
