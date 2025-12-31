'use client';

import { Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateInvoiceDialog } from '@/components/create-invoice-dialog';
import { useInvoices, useDeleteInvoice } from '@/hooks/use-invoices';
import { InvoiceStatus } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

export default function MyRequestsPage() {
    const { data: invoices, isLoading, error } = useInvoices();
    const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            deleteInvoice(id);
        }
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        switch (status) {
            case 'Approved':
                return (
                    <Badge variant="outline" className="h-5 bg-green-50 text-green-700 border-green-200 hover:bg-green-50 px-2 text-[10px] uppercase tracking-wide font-semibold">
                        Approved
                    </Badge>
                );
            case 'Rejected':
                return (
                    <Badge variant="outline" className="h-5 bg-red-50 text-red-700 border-red-200 hover:bg-red-50 px-2 text-[10px] uppercase tracking-wide font-semibold">
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="h-5 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 px-2 text-[10px] uppercase tracking-wide font-semibold">
                        Pending
                    </Badge>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner className="h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center text-destructive text-sm">
                Failed to load requests. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">My Requests</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage your invoice requests and view their status.
                    </p>
                </div>
                {/* onSuccess is no longer needed as the query invalidates itself */}
                <CreateInvoiceDialog />
            </div>

            <div className="rounded border bg-card/50">
                <Table>
                    <TableHeader>
                        <TableRow className="h-9 hover:bg-transparent">
                            <TableHead className="w-[100px] h-9 text-xs font-semibold">ID</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Vendor</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Date</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Amount</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Status</TableHead>
                            <TableHead className="h-9 text-xs font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!invoices || invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id} className="h-10">
                                    <TableCell className="font-medium text-xs dark:text-gray-300">#{invoice.id}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{invoice.vendorName}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-xs font-medium dark:text-gray-300">${invoice.amount.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {invoice.status === 'Pending' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(invoice.id)}
                                                disabled={isDeleting}
                                                title="Delete Invoice"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
