'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

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

// Invoice Type Definition (shared with parent ideally, but defining here for now or importing if we had a types file)
// For this task, we'll define the shape expected by the parent.
export interface Invoice {
    id: string;
    vendor: string;
    date: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

const invoiceSchema = z.object({
    vendor: z.enum(['Dell', 'Staples', 'Tenaga Nasional', 'Microsoft']),
    amount: z.coerce
        .number()
        .min(0.01, 'Amount must be greater than 0')
        .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
});

type InvoiceValues = z.infer<typeof invoiceSchema>;

interface CreateInvoiceDialogProps {
    onSuccess: (invoice: Invoice) => void;
}

export function CreateInvoiceDialog({ onSuccess }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
        trigger,
    } = useForm<InvoiceValues>({
        resolver: zodResolver(invoiceSchema) as any,
    });

    const selectedVendor = watch('vendor');

    const onSubmit = (data: InvoiceValues) => {
        const newInvoice: Invoice = {
            id: Math.random().toString(36).substring(2, 9).toUpperCase(),
            vendor: data.vendor,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            amount: data.amount,
            status: 'Pending',
        };

        onSuccess(newInvoice);
        toast.success('Request created successfully');
        setOpen(false);
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 h-8 text-xs font-medium">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Create Request
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 bg-slate-50/50 border-b space-y-1">
                    <DialogTitle className="text-sm font-semibold">New Invoice Request</DialogTitle>
                    <DialogDescription className="text-xs">
                        Submit a new invoice for approval. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-3 p-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="vendor" className="text-right text-xs font-medium text-muted-foreground">
                                Vendor
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    onValueChange={(value) => {
                                        setValue('vendor', value as any);
                                        trigger('vendor');
                                    }}
                                    value={selectedVendor}
                                >
                                    <SelectTrigger id="vendor" className="h-8 text-xs">
                                        <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dell" className="text-xs">Dell</SelectItem>
                                        <SelectItem value="Staples" className="text-xs">Staples</SelectItem>
                                        <SelectItem value="Tenaga Nasional" className="text-xs">Tenaga Nasional</SelectItem>
                                        <SelectItem value="Microsoft" className="text-xs">Microsoft</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.vendor && (
                                    <p className="text-[10px] text-destructive font-medium mt-1">
                                        {errors.vendor.message}
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
                                    {...register('amount')}
                                />
                                {errors.amount && (
                                    <p className="text-[10px] text-destructive font-medium mt-1">
                                        {errors.amount.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-3 bg-slate-50/50 border-t">
                        <Button type="submit" size="sm" className="h-8 text-xs w-full sm:w-auto">Submit Request</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
