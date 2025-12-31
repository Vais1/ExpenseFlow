import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Vendor, VendorCreateDto, VendorSchema, VendorUpdateDto } from '@/lib/types';
import { toast } from 'sonner';
import { z } from 'zod';

const vendorKeys = {
    all: ['vendors'] as const,
    detail: (id: number) => [...vendorKeys.all, id] as const,
};

export function useVendors() {
    return useQuery({
        queryKey: vendorKeys.all,
        queryFn: async () => {
            const { data } = await api.get('/vendor');
            return z.array(VendorSchema).parse(data);
        },
    });
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
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to add vendor.",
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
            toast.success("Vendor Updated", {
                description: "Vendor details have been updated.",
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to update vendor.",
            });
        },
    });
}

export function useDeleteVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/vendor/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
            toast.success("Vendor Deleted", {
                description: "Vendor has been removed from the system.",
            });
        },
        onError: (error: any) => {
            toast.error("Error", {
                description: error.response?.data?.message || "Failed to delete vendor.",
            });
        },
    });
}
