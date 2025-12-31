'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInvoices } from '@/hooks/use-invoices';
import { InvoiceStatus } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

export default function AllInvoicesPage() {
    const { data: invoices, isLoading, error } = useInvoices();

    // Reusing the badge logic for consistency
    const getStatusBadge = (status: InvoiceStatus) => {
        switch (status) {
            case 'Approved':
                return (
                    <Badge variant="outline" className="h-5 bg-green-50 text-green-700 border-green-200 px-2 text-[10px] uppercase tracking-wide font-semibold">
                        Approved
                    </Badge>
                );
            case 'Rejected':
                return (
                    <Badge variant="outline" className="h-5 bg-red-50 text-red-700 border-red-200 px-2 text-[10px] uppercase tracking-wide font-semibold">
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="h-5 bg-yellow-50 text-yellow-700 border-yellow-200 px-2 text-[10px] uppercase tracking-wide font-semibold">
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
                Failed to load invoices. Please try again.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">All Invoices</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        View all invoices across the organization.
                    </p>
                </div>
            </div>

            <div className="rounded border bg-card/50">
                <Table>
                    <TableHeader>
                        <TableRow className="h-9 hover:bg-transparent">
                            <TableHead className="w-[80px] h-9 text-xs font-semibold">ID</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">User</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Vendor</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Date</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Amount</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!invoices || invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id} className="h-10">
                                    <TableCell className="font-medium text-xs dark:text-gray-300">#{invoice.id}</TableCell>
                                    <TableCell className="text-xs text-foreground font-medium">{invoice.username}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{invoice.vendorName}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-xs font-medium dark:text-gray-300">${invoice.amount.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
