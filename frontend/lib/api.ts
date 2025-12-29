import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants";

// Generic API client with auth token injection
async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem(STORAGE_KEYS.accessToken)
            : null;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// Invoice API
export const invoiceApi = {
    getAll: () => apiClient<import("@/types/api").Invoice[]>("/api/invoice"),

    getById: (id: number) =>
        apiClient<import("@/types/api").Invoice>(`/api/invoice/${id}`),

    create: (data: import("@/types/api").CreateInvoiceDto) =>
        apiClient<import("@/types/api").Invoice>("/api/invoice", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updateStatus: (id: number, status: import("@/types/api").InvoiceStatus) =>
        apiClient<import("@/types/api").Invoice>(`/api/invoice/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        }),

    delete: (id: number) =>
        apiClient<void>(`/api/invoice/${id}`, {
            method: "DELETE",
        }),
};

// Vendor API
export const vendorApi = {
    getAll: () => apiClient<import("@/types/api").Vendor[]>("/api/vendor"),

    getById: (id: number) =>
        apiClient<import("@/types/api").Vendor>(`/api/vendor/${id}`),

    create: (data: import("@/types/api").CreateVendorDto) =>
        apiClient<import("@/types/api").Vendor>("/api/vendor", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: number, data: import("@/types/api").UpdateVendorDto) =>
        apiClient<import("@/types/api").Vendor>(`/api/vendor/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id: number) =>
        apiClient<void>(`/api/vendor/${id}`, {
            method: "DELETE",
        }),
};
