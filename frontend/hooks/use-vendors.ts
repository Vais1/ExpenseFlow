"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorService } from "@/services/api";
import type { CreateVendorDto, UpdateVendorDto } from "@/types/api";

// Query Keys
export const vendorKeys = {
    all: ["vendors"] as const,
    detail: (id: number) => ["vendors", id] as const,
};

// Fetch all vendors
export function useVendorsList() {
    return useQuery({
        queryKey: vendorKeys.all,
        queryFn: vendorService.getAll,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Create vendor
export function useCreateVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateVendorDto) => vendorService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
    });
}

// Update vendor
export function useUpdateVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateVendorDto }) =>
            vendorService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
    });
}

// Delete vendor
export function useDeleteVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => vendorService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendorKeys.all });
        },
    });
}
