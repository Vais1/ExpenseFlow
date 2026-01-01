'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { InvoiceCreateSchema } from '@/lib/types';
import { useCreateInvoice } from '@/hooks/use-invoices';
import { useActiveVendors } from '@/hooks/use-vendors';

type InvoiceFormValues = z.infer<typeof InvoiceCreateSchema>;

export function CreateInvoiceDialog() {
    const [open, setOpen] = useState(false);
    const [isOtherVendor, setIsOtherVendor] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const { mutate: createInvoice, isPending } = useCreateInvoice();
    const { data: vendors, isLoading: isLoadingVendors } = useActiveVendors();

    useEffect(() => {
        if (searchParams.get('action') === 'new') {
            setOpen(true);
        }
    }, [searchParams]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            const params = new URLSearchParams(searchParams.toString());
            if (params.get('action') === 'new') {
                params.delete('action');
                router.replace(`${pathname}?${params.toString()}`);
            }
            reset();
            setIsOtherVendor(false);
        }
    };

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
        trigger,
    } = useForm<InvoiceFormValues>({
        resolver: zodResolver(InvoiceCreateSchema),
        defaultValues: {
            amount: undefined,
            description: '',
        }
    });

    const selectedVendorName = watch('vendorName');

    const onSubmit = (data: InvoiceFormValues) => {
        const finalVendorName = isOtherVendor ? data.customVendorName : data.vendorName;

        if (!finalVendorName) {
            toast.error("Please specify a vendor");
            return;
        }

        createInvoice({
            amount: data.amount,
            description: data.description,
            vendorName: finalVendorName,
        }, {
            onSuccess: () => {
                toast.success('Invoice created successfully');
                handleOpenChange(false);
            },
            onError: () => {
                toast.error('Failed to create invoice');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 h-8 text-xs font-medium">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Create Request
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 bg-slate-50/50 border-b space-y-1 dark:bg-slate-900/50">
                    <DialogTitle className="text-sm font-semibold">New Invoice Request</DialogTitle>
                    <DialogDescription className="text-xs">
                        Submit a new invoice for approval. Only active vendors are available.
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

                                {errors.vendorName && !isOtherVendor && (
                                    <p className="text-[10px] text-destructive font-medium mt-1">{errors.vendorName.message}</p>
                                )}
                                {errors.customVendorName && isOtherVendor && (
                                    <p className="text-[10px] text-destructive font-medium mt-1">{errors.customVendorName.message}</p>
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
                        <Button type="submit" size="sm" className="h-8 text-xs w-full sm:w-auto" disabled={isPending}>
                            {isPending ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
