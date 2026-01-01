import { z } from 'zod';

// --- User Types ---

export const UserRoleEnum = z.enum(["User", "Admin"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

// --- Vendor Types ---

export const VendorStatusEnum = z.enum(["Active", "Inactive"]);
export type VendorStatus = z.infer<typeof VendorStatusEnum>;

export const VendorSchema = z.object({
    id: z.number(),
    name: z.string(),
    category: z.string(),
    status: VendorStatusEnum,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const VendorCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
});

export const VendorUpdateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    status: VendorStatusEnum.optional(),
});

export type Vendor = z.infer<typeof VendorSchema>;
export type VendorCreateDto = z.infer<typeof VendorCreateSchema>;
export type VendorUpdateDto = z.infer<typeof VendorUpdateSchema>;

// --- Invoice Types ---

export const InvoiceStatusEnum = z.enum(["Pending", "Approved", "Rejected", "Withdrawn"]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;

export const InvoiceSchema = z.object({
    id: z.number(),
    amount: z.number(),
    description: z.string(),
    status: InvoiceStatusEnum,
    rejectionReason: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    vendorId: z.number(),
    userId: z.number(),
    vendorName: z.string(),
    vendorCategory: z.string(),
    username: z.string(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const InvoiceCreateSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    vendorId: z.number().optional(),
    vendorName: z.string().optional(),
    customVendorName: z.string().optional(),
    notes: z.string().optional(),
}).refine(data => data.vendorName || data.customVendorName, {
    message: "Please select or enter a vendor",
    path: ["vendorName"]
});

export const InvoiceUpdateStatusSchema = z.object({
    status: InvoiceStatusEnum,
    rejectionReason: z.string().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceCreateDto = z.infer<typeof InvoiceCreateSchema>;
export type InvoiceUpdateStatusDto = z.infer<typeof InvoiceUpdateStatusSchema>;

// --- Invoice Activity Types (Audit Log) ---

export const InvoiceActivityActionEnum = z.enum(["Created", "Approved", "Rejected", "Updated", "Deleted", "Withdrawn"]);
export type InvoiceActivityAction = z.infer<typeof InvoiceActivityActionEnum>;

export const InvoiceActivitySchema = z.object({
    id: z.number(),
    invoiceId: z.number(),
    action: InvoiceActivityActionEnum,
    performedById: z.number(),
    performedByUsername: z.string(),
    performedByRole: z.string(),
    metadata: z.string().nullable().optional(),
    timestamp: z.string().datetime(),
});

export type InvoiceActivity = z.infer<typeof InvoiceActivitySchema>;

// --- Common Responses ---
export const HealthSchema = z.object({
    status: z.string(),
});


