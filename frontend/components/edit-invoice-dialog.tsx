'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUpdateInvoice, InvoiceUpdateDto } from '@/hooks/use-invoices';
import { useActiveVendors } from '@/hooks/use-vendors';
import { Invoice } from '@/lib/types';

const EditInvoiceSchema = z.object({
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    vendorName: z.string().optional(),
    customVendorName: z.string().optional(),
});

type EditInvoiceFormValues = z.infer<typeof EditInvoiceSchema>;

interface EditInvoiceDialogProps {
    invoice: Invoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditInvoiceDialog({ invoice, open, onOpenChange }: EditInvoiceDialogProps) {
    const [isOtherVendor, setIsOtherVendor] = useState(false);

    const { mutate: updateInvoice, isPending } = useUpdateInvoice();
    const { data: vendors, isLoading: isLoadingVendors } = useActiveVendors();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
        trigger,
    } = useForm<EditInvoiceFormValues>({
        resolver: zodResolver(EditInvoiceSchema),
    });

    const selectedVendorName = watch('vendorName');

    useEffect(() => {
        if (invoice && open) {
            reset({
                amount: invoice.amount,
                description: invoice.description,
                vendorName: invoice.vendorName,
            });
            setIsOtherVendor(false);
        }
    }, [invoice, open, reset]);

    const handleClose = () => {
        onOpenChange(false);
        reset();
        setIsOtherVendor(false);
    };

    const onSubmit = (data: EditInvoiceFormValues) => {
        if (!invoice) return;

        const finalVendorName = isOtherVendor ? data.customVendorName : data.vendorName;

        const updateData: InvoiceUpdateDto = {
            amount: data.amount,
            description: data.description,
            vendorName: finalVendorName,
        };

        updateInvoice(
            { id: invoice.id, data: updateData },
            {
                onSuccess: () => {
                    handleClose();
                },
            }
        );
    };

    if (!invoice) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 bg-slate-50/50 border-b space-y-1 dark:bg-slate-900/50">
                    <DialogTitle className="text-sm font-semibold">Edit Invoice #{invoice.id}</DialogTitle>
                    <DialogDescription className="text-xs">
                        Update your pending invoice. You can only edit pending invoices.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-3 p-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="vendor" className="text-right text-xs font-medium text-muted-foreground">
                                Vendor
                            </Label>
                            <div className="col-span-3 space-y-2">
                                <Select
                                    disabled={isLoadingVendors}
                                    onValueChange={(value) => {
                                        if (value === "other") {
                                            setIsOtherVendor(true);
                                            setValue('vendorName', '');
                                        } else {
                                            setIsOtherVendor(false);
                                            setValue('vendorName', value);
                                            setValue('customVendorName', undefined);
                                        }
                                        trigger('vendorName');
                                    }}
                                    value={isOtherVendor ? "other" : selectedVendorName || ""}
                                >
                                    <SelectTrigger id="vendor" className="h-8 text-xs">
                                        {isLoadingVendors ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                <span>Loading...</span>
                                            </div>
                                        ) : (
                                            <SelectValue placeholder="Select vendor" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendors && vendors.length > 0 ? (
                                            vendors.map((vendor) => (
                                                <SelectItem key={vendor.id} value={vendor.name} className="text-xs">
                                                    {vendor.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="__empty__" disabled className="text-xs text-muted-foreground">
                                                No active vendors
                                            </SelectItem>
                                        )}
                                        <SelectItem value="other" className="text-xs font-medium text-primary">
                                            Other...
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {isOtherVendor && (
                                    <Input
                                        placeholder="Enter vendor name"
                                        className="h-8 text-xs"
                                        {...register('customVendorName')}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right text-xs font-medium text-muted-foreground">
                                Description
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="description"
                                    placeholder="Office supplies..."
                                    className="h-8 text-xs"
                                    {...register('description')}
                                />
                                {errors.description && (
                                    <p className="text-[10px] text-destructive font-medium mt-1">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right text-xs font-medium text-muted-foreground">
                                Amount
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-8 text-xs"
                                    {...register('amount', { valueAsNumber: true })}
                                />
                                {errors.amount && (
                                    <p className="text-[10px] text-destructive font-medium mt-1">
                                        {errors.amount.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-3 bg-slate-50/50 border-t dark:bg-slate-900/50">
                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" className="h-8 text-xs" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
