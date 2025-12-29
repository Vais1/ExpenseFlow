"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateVendor, useUpdateVendor } from "@/hooks/use-vendors";
import type { Vendor } from "@/types/api";

// Shadcn UI
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons
import { Loader2 } from "lucide-react";

// Validation schema
const vendorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().max(20).optional().or(z.literal("")),
    address: z.string().max(200).optional().or(z.literal("")),
    category: z.string().max(50).optional().or(z.literal("")),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendor?: Vendor | null; // If provided, edit mode; otherwise, create mode
    onSuccess?: () => void;
}

export function VendorDialog({ open, onOpenChange, vendor, onSuccess }: VendorDialogProps) {
    const isEditMode = !!vendor;

    const createMutation = useCreateVendor();
    const updateMutation = useUpdateVendor();

    const form = useForm<VendorFormData>({
        resolver: zodResolver(vendorSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            category: "",
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (vendor) {
            form.reset({
                name: vendor.name || "",
                email: vendor.email || "",
                phone: vendor.phone || "",
                address: vendor.address || "",
                category: vendor.category || "",
            });
        } else {
            form.reset({
                name: "",
                email: "",
                phone: "",
                address: "",
                category: "",
            });
        }
    }, [vendor, form]);

    const onSubmit = (data: VendorFormData) => {
        const payload = {
            name: data.name,
            email: data.email || undefined,
            phone: data.phone || undefined,
            address: data.address || undefined,
            category: data.category || undefined,
        };

        if (isEditMode && vendor) {
            updateMutation.mutate(
                { id: vendor.id, data: payload },
                {
                    onSuccess: () => {
                        form.reset();
                        onOpenChange(false);
                        onSuccess?.();
                    },
                }
            );
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    form.reset();
                    onOpenChange(false);
                    onSuccess?.();
                },
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const error = createMutation.error || updateMutation.error;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Vendor" : "Create Vendor"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the vendor information below."
                            : "Add a new vendor to the system."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            placeholder="Vendor name"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            placeholder="e.g., Office Supplies, IT Services"
                            {...form.register("category")}
                        />
                        {form.formState.errors.category && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.category.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="vendor@example.com"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="+1 234 567 8900"
                            {...form.register("phone")}
                        />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            placeholder="123 Main St, City"
                            {...form.register("address")}
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <p className="text-sm text-destructive">
                            {error instanceof Error ? error.message : "An error occurred"}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : isEditMode ? (
                                "Update Vendor"
                            ) : (
                                "Create Vendor"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
