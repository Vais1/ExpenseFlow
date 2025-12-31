import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Invoice, InvoiceCreateDto, InvoiceSchema, InvoiceUpdateStatusDto } from '@/lib/types';
import { toast } from 'sonner';
import { z } from 'zod';

const invoiceKeys = {
    all: ['invoices'] as const,
    detail: (id: number) => [...invoiceKeys.all, id] as const,
};

export function useInvoices() {
    return useQuery({
        queryKey: invoiceKeys.all,
        queryFn: async () => {
            const { data } = await api.get('/invoice');
            return z.array(InvoiceSchema).parse(data);
        },
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
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to create invoice.",
            });
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number } & InvoiceUpdateStatusDto) => {
            const { data } = await api.patch(`/invoice/${id}/status`, { status });
            return InvoiceSchema.parse(data);
        },
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: invoiceKeys.all });
            const previousInvoices = queryClient.getQueryData<Invoice[]>(invoiceKeys.all);

            if (previousInvoices) {
                queryClient.setQueryData<Invoice[]>(invoiceKeys.all, (old) =>
                    old?.map((inv) => (inv.id === id ? { ...inv, status } : inv))
                );
            }

            return { previousInvoices };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(invoiceKeys.all, context?.previousInvoices);
            toast.error("Error", {
                description: "Failed to update invoice status.",
            });
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
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
            toast.success("Invoice Deleted", {
                description: "The invoice has been removed.",
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to delete invoice.",
            });
        }
    });
}
