"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInvoice, useVendors } from "@/hooks/use-invoices";

// Shadcn UI
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

// Icons
import { Plus, Loader2 } from "lucide-react";

// Validation schema
const createInvoiceSchema = z.object({
    vendorId: z.number().min(1, "Please select a vendor"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().min(3, "Description must be at least 3 characters"),
});

type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;

interface CreateInvoiceDialogProps {
    children?: React.ReactNode;
}

export function CreateInvoiceDialog({ children }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false);

    const { data: vendors, isLoading: vendorsLoading } = useVendors();
    const createMutation = useCreateInvoice();

    const form = useForm<CreateInvoiceFormData>({
        resolver: zodResolver(createInvoiceSchema),
        defaultValues: {
            vendorId: 0,
            amount: 0,
            description: "",
        },
    });

    const onSubmit = (data: CreateInvoiceFormData) => {
        createMutation.mutate(data, {
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Request
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Submit a new invoice request for approval.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {/* Vendor Select */}
                    <div className="space-y-2">
                        <Label htmlFor="vendor">Vendor</Label>
                        {vendorsLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <Select
                                onValueChange={(value) =>
                                    form.setValue("vendorId", parseInt(value, 10))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors?.map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                            {vendor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {form.formState.errors.vendorId && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.vendorId.message}
                            </p>
                        )}
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...form.register("amount", { valueAsNumber: true })}
                        />
                        {form.formState.errors.amount && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.amount.message}
                            </p>
                        )}
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Invoice description..."
                            {...form.register("description")}
                        />
                        {form.formState.errors.description && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Error Display */}
                    {createMutation.error && (
                        <p className="text-sm text-destructive">
                            {createMutation.error instanceof Error
                                ? createMutation.error.message
                                : "Failed to create invoice"}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Invoice"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
