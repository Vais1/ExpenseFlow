// Invoice and Vendor Types for VendorPay

export interface Invoice {
    id: number;
    amount: number;
    description: string;
    status: InvoiceStatus;
    vendorId: number;
    vendorName: string;
    userId: number;
    username: string;
    createdAt: string;
    updatedAt: string;
}

export interface Vendor {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateVendorDto {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    category?: string;
}

export interface UpdateVendorDto {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    category?: string;
}

export interface CreateInvoiceDto {
    vendorId: number;
    amount: number;
    description: string;
}

export enum InvoiceStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
}

// Auth Types
export interface LoginDto {
    username: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    password: string;
    confirmPassword?: string;
    role: number; // 0=User, 1=Management, 2=Admin
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface User {
    id: number;
    username: string;
    role: number | string; // Handle both simplified and complex role types
}

// API Response types
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}
