import api from "@/lib/axios";
import type {
    User,
    Vendor,
    Invoice,
    LoginDto,
    RegisterDto,
    AuthResponse,
    CreateVendorDto,
    UpdateVendorDto,
    CreateInvoiceDto,
    InvoiceStatus,
} from "@/types/api";

export const authService = {
    register: async (data: RegisterDto): Promise<void> => {
        await api.post("/api/auth/register", data);
    },

    login: async (data: LoginDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/api/auth/login", data);
        return response.data;
    },
};

export const vendorService = {
    getAll: async (): Promise<Vendor[]> => {
        const response = await api.get<Vendor[]>("/api/vendor");
        return response.data;
    },

    getById: async (id: number): Promise<Vendor> => {
        const response = await api.get<Vendor>(`/api/vendor/${id}`);
        return response.data;
    },

    create: async (data: CreateVendorDto): Promise<Vendor> => {
        const response = await api.post<Vendor>("/api/vendor", data);
        return response.data;
    },

    update: async (id: number, data: UpdateVendorDto): Promise<Vendor> => {
        const response = await api.put<Vendor>(`/api/vendor/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/vendor/${id}`);
    },
};

export const invoiceService = {
    getAll: async (): Promise<Invoice[]> => {
        // Backend filters by role automatically based on JWT
        const response = await api.get<Invoice[]>("/api/invoice");
        return response.data;
    },

    create: async (data: CreateInvoiceDto): Promise<Invoice> => {
        const response = await api.post<Invoice>("/api/invoice", data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/api/invoice/${id}`);
    },

    updateStatus: async (id: number, status: InvoiceStatus): Promise<void> => {
        // Ensure status is sent as an integer
        // 1 = Approved, 2 = Rejected
        await api.patch(`/api/invoice/${id}/status`, { status });
    },
};
