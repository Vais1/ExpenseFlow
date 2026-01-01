import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Invoice, InvoiceCreateDto, InvoiceSchema, InvoiceUpdateStatusDto, InvoiceStatus, InvoiceActivity, InvoiceActivitySchema } from '@/lib/types';
import { toast } from 'sonner';
import { z } from 'zod';

export interface InvoiceFilters {
    status?: number; // 0=Pending, 1=Approved, 2=Rejected
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    fromDate?: string;
    toDate?: string;
}

const invoiceKeys = {
    all: ['invoices'] as const,
    filtered: (filters: InvoiceFilters) => [...invoiceKeys.all, 'filtered', filters] as const,
    detail: (id: number) => [...invoiceKeys.all, 'detail', id] as const,
    activity: (id: number) => [...invoiceKeys.all, 'activity', id] as const,
};

export function useInvoices(filters?: InvoiceFilters) {
    return useQuery({
        queryKey: filters ? invoiceKeys.filtered(filters) : invoiceKeys.all,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status !== undefined) params.append('status', String(filters.status));
            if (filters?.sortBy) params.append('sortBy', filters.sortBy);
            if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
            if (filters?.search) params.append('search', filters.search);
            if (filters?.fromDate) params.append('fromDate', filters.fromDate);
            if (filters?.toDate) params.append('toDate', filters.toDate);

            const url = params.toString() ? `/invoice?${params.toString()}` : '/invoice';
            const { data } = await api.get(url);
            return z.array(InvoiceSchema).parse(data);
        },
    });
}

export function useInvoice(id: number) {
    return useQuery({
        queryKey: invoiceKeys.detail(id),
        queryFn: async () => {
            const { data } = await api.get(`/invoice/${id}`);
            return InvoiceSchema.parse(data);
        },
        enabled: id > 0,
    });
}

export function useInvoiceActivity(id: number) {
    return useQuery({
        queryKey: invoiceKeys.activity(id),
        queryFn: async () => {
            const { data } = await api.get(`/invoice/${id}/activity`);
            return z.array(InvoiceActivitySchema).parse(data);
        },
        enabled: id > 0,
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newInvoice: InvoiceCreateDto) => {
            const { data } = await api.post('/invoice', newInvoice);
            return InvoiceSchema.parse(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            toast.success("Invoice Request Created", {
                description: "Your invoice has been submitted successfully.",
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error("Error", {
                description: err.response?.data?.message ?? "Failed to create invoice.",
            });
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status, rejectionReason }: { id: number; status: InvoiceStatus; rejectionReason?: string }) => {
            const payload: InvoiceUpdateStatusDto = { status };
            if (rejectionReason) {
                payload.rejectionReason = rejectionReason;
            }
            const { data } = await api.patch(`/invoice/${id}/status`, payload);
            return InvoiceSchema.parse(data);
        },
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: invoiceKeys.all });
            const previousInvoices = queryClient.getQueryData<Invoice[]>(invoiceKeys.all);

            // Optimistic update for all invoice queries
            queryClient.setQueriesData<Invoice[]>(
                { queryKey: invoiceKeys.all },
                (old) => old?.map((inv) => (inv.id === id ? { ...inv, status } : inv))
            );

            return { previousInvoices };
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            if (context?.previousInvoices) {
                queryClient.setQueryData(invoiceKeys.all, context.previousInvoices);
            }
            const error = err as { response?: { data?: { message?: string } } };
            toast.error("Update Failed", {
                description: error.response?.data?.message ?? "Failed to update invoice status. Changes have been reverted.",
            });
        },
        onSuccess: (_, { id }) => {
            toast.success("Status Updated", {
                description: "Invoice status has been updated successfully.",
            });
            // Also invalidate activity to show new entry
            queryClient.invalidateQueries({ queryKey: invoiceKeys.activity(id) });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
    });
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/invoice/${id}`);
            return id;
        },
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: invoiceKeys.all });
            const previousInvoices = queryClient.getQueryData<Invoice[]>(invoiceKeys.all);

            // Optimistic removal
            queryClient.setQueriesData<Invoice[]>(
                { queryKey: invoiceKeys.all },
                (old) => old?.filter((inv) => inv.id !== id)
            );

            return { previousInvoices };
        },
        onError: (err, _id, context) => {
            // Rollback on error
            if (context?.previousInvoices) {
                queryClient.setQueryData(invoiceKeys.all, context.previousInvoices);
            }
            const error = err as { response?: { data?: { message?: string } } };
            toast.error("Delete Failed", {
                description: error.response?.data?.message ?? "Failed to delete invoice. Changes have been reverted.",
            });
        },
        onSuccess: () => {
            toast.success("Invoice Deleted", {
                description: "The invoice has been removed.",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
    });
}

// --- New Hooks ---

export interface InvoiceUpdateDto {
    amount: number;
    description: string;
    vendorId?: number;
    vendorName?: string;
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: InvoiceUpdateDto }) => {
            const { data: response } = await api.put(`/invoice/${id}`, data);
            return InvoiceSchema.parse(response);
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
            toast.success("Invoice Updated", {
                description: "Your invoice has been updated successfully.",
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error("Update Failed", {
                description: err.response?.data?.message ?? "Failed to update invoice.",
            });
        },
    });
}

export function useWithdrawInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.post(`/invoice/${id}/withdraw`);
            return InvoiceSchema.parse(data);
        },
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: invoiceKeys.all });
            const previousInvoices = queryClient.getQueryData<Invoice[]>(invoiceKeys.all);

            // Optimistic update
            queryClient.setQueriesData<Invoice[]>(
                { queryKey: invoiceKeys.all },
                (old) => old?.map((inv) => (inv.id === id ? { ...inv, status: 'Withdrawn' as InvoiceStatus } : inv))
            );

            return { previousInvoices };
        },
        onError: (err, _id, context) => {
            if (context?.previousInvoices) {
                queryClient.setQueryData(invoiceKeys.all, context.previousInvoices);
            }
            const error = err as { response?: { data?: { message?: string } } };
            toast.error("Withdraw Failed", {
                description: error.response?.data?.message ?? "Failed to withdraw invoice.",
            });
        },
        onSuccess: () => {
            toast.success("Invoice Withdrawn", {
                description: "Your invoice has been withdrawn successfully.",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
        },
    });
}

export interface DashboardStats {
    totalInvoices: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    withdrawnCount: number;
    totalAmount: number;
    pendingAmount: number;
    approvedAmount: number;
}

const DashboardStatsSchema = z.object({
    totalInvoices: z.number(),
    pendingCount: z.number(),
    approvedCount: z.number(),
    rejectedCount: z.number(),
    withdrawnCount: z.number(),
    totalAmount: z.number(),
    pendingAmount: z.number(),
    approvedAmount: z.number(),
});

export function useDashboardStats() {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await api.get('/invoice/stats');
            return DashboardStatsSchema.parse(data);
        },
    });
}

export function useBulkUpdateStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ invoiceIds, status, rejectionReason }: { invoiceIds: number[]; status: InvoiceStatus; rejectionReason?: string }) => {
            const statusNum = status === 'Approved' ? 1 : 2;
            const { data } = await api.post('/invoice/bulk-status', {
                invoiceIds,
                status: statusNum,
                rejectionReason,
            });
            return data as { message: string; count: number };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            toast.success("Bulk Update Complete", {
                description: data.message,
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error("Bulk Update Failed", {
                description: err.response?.data?.message ?? "Failed to update invoices.",
            });
        },
    });
}
