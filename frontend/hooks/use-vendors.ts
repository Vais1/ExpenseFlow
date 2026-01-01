import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Vendor, VendorCreateDto, VendorSchema, VendorUpdateDto } from '@/lib/types';
import { toast } from 'sonner';
import { z } from 'zod';

const vendorKeys = {
    all: ['vendors'] as const,
    active: ['vendors', 'active'] as const,
    detail: (id: number) => [...vendorKeys.all, id] as const,
};

export function useVendors(activeOnly = false) {
    return useQuery({
        queryKey: activeOnly ? vendorKeys.active : vendorKeys.all,
        queryFn: async () => {
            const url = activeOnly ? '/vendor?activeOnly=true' : '/vendor';
            const { data } = await api.get(url);
            return z.array(VendorSchema).parse(data);
        },
    });
}

// Convenience hook for invoice creation - only shows active vendors
export function useActiveVendors() {
    return useVendors(true);
}

export function useCreateVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newVendor: VendorCreateDto) => {
            const { data } = await api.post('/vendor', newVendor);
            return VendorSchema.parse(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
            toast.success("Vendor Added", {
                description: "New vendor has been successfully added.",
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error("Error", {
                description: err.response?.data?.message ?? "Failed to add vendor.",
            });
        },
    });
}

export function useUpdateVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: VendorUpdateDto }) => {
            const { data } = await api.put(`/vendor/${id}`, payload);
            return VendorSchema.parse(data);
        },
        onMutate: async ({ id, payload }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: vendorKeys.all });

            // Snapshot previous value
            const previousVendors = queryClient.getQueryData<Vendor[]>(vendorKeys.all);

            // Optimistically update
            queryClient.setQueriesData<Vendor[]>(
                { queryKey: vendorKeys.all },
                (old) => old?.map((v) =>
                    v.id === id
                        ? { ...v, name: payload.name, category: payload.category, status: payload.status ?? v.status }
                        : v
                )
            );

            return { previousVendors };
        },
        onError: (err, _vars, context) => {
            // Rollback on error
            if (context?.previousVendors) {
                queryClient.setQueryData(vendorKeys.all, context.previousVendors);
            }
            const error = err as { response?: { data?: { message?: string } } };
            toast.error("Update Failed", {
                description: error.response?.data?.message ?? "Failed to update vendor. Changes have been reverted.",
            });
        },
        onSuccess: () => {
            toast.success("Vendor Updated", {
                description: "Vendor details have been updated.",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
    });
}

export function useDeleteVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/vendor/${id}`);
            return id;
        },
        onMutate: async (id: number) => {
            await queryClient.cancelQueries({ queryKey: vendorKeys.all });
            const previousVendors = queryClient.getQueryData<Vendor[]>(vendorKeys.all);

            // Optimistic removal
            queryClient.setQueriesData<Vendor[]>(
                { queryKey: vendorKeys.all },
                (old) => old?.filter((v) => v.id !== id)
            );

            return { previousVendors };
        },
        onError: (err, _id, context) => {
            // Rollback on error
            if (context?.previousVendors) {
                queryClient.setQueryData(vendorKeys.all, context.previousVendors);
            }
            const error = err as { response?: { data?: { message?: string } } };
            toast.error("Delete Failed", {
                description: error.response?.data?.message ?? "Failed to delete vendor. Changes have been reverted.",
            });
        },
        onSuccess: () => {
            toast.success("Vendor Deleted", {
                description: "Vendor has been removed from the system.",
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
    });
}
