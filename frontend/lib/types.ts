import { z } from 'zod';

// --- Vendor Types ---

export const VendorSchema = z.object({
    id: z.number(),
    name: z.string(),
    category: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const VendorCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
});

export const VendorUpdateSchema = VendorCreateSchema;

export type Vendor = z.infer<typeof VendorSchema>;
export type VendorCreateDto = z.infer<typeof VendorCreateSchema>;
export type VendorUpdateDto = z.infer<typeof VendorUpdateSchema>;

// --- Invoice Types ---

export const InvoiceStatusEnum = z.enum(["Pending", "Approved", "Rejected"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const InvoiceSchema = z.object({
    id: z.number(),
    amount: z.number(),
    description: z.string(),
    status: InvoiceStatusEnum,
    vendorId: z.number(),
    userId: z.number(),
    vendorName: z.string(),
    vendorCategory: z.string(),
    username: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

// Update: VendorId now optional, added vendorName
export const InvoiceCreateSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    vendorId: z.number().optional(),
    vendorName: z.string().optional(),
    customVendorName: z.string().optional(), // Helper for frontend form
}).refine(data => data.vendorName || data.customVendorName, {
    message: "Please select or enter a vendor",
    path: ["vendorName"]
});

export const InvoiceUpdateStatusSchema = z.object({
    status: InvoiceStatusEnum
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceCreateDto = z.infer<typeof InvoiceCreateSchema>;
export type InvoiceUpdateStatusDto = z.infer<typeof InvoiceUpdateStatusSchema>;

// --- Common Responses ---
export const HealthSchema = z.object({
    status: z.string(),
});
