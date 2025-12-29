"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService } from "@/services/api";
import type { InvoiceStatus, CreateInvoiceDto } from "@/types/api";

// Query Keys
export const invoiceKeys = {
    all: ["invoices"] as const,
    detail: (id: number) => ["invoices", id] as const,
};

// Fetch all invoices
// Logic for filtering (User vs Admin) is handled by the backend based on the token
export function useAllInvoices() {
    return useQuery({
        queryKey: invoiceKeys.all,
        queryFn: invoiceService.getAll,
        staleTime: 1000 * 60, // 1 minute
    });
}

// Alias for customer dashboard (same endpoint, backend filters)
export function useMyInvoices() {
    return useAllInvoices();
}

// Create invoice
export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInvoiceDto) => invoiceService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
    });
}

// Update invoice status
export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: InvoiceStatus }) =>
            invoiceService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
    });
}

// Delete invoice
export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => invoiceService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
    });
}
