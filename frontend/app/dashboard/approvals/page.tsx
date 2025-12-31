'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
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
import { authService } from '@/services/auth';
import { useInvoices, useUpdateInvoiceStatus } from '@/hooks/use-invoices';
import { InvoiceStatus } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';

export default function ApprovalsPage() {
    const router = useRouter();
    const { data: invoices, isLoading, error } = useInvoices();
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateInvoiceStatus();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const session = authService.getSession();
        if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Management')) {
            router.push('/dashboard');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    const handleAction = (id: number, status: InvoiceStatus) => {
        updateStatus({ id, status });
    };

    if (!isAuthorized) return null;

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
                Failed to load approvals. Please try again.
            </div>
        );
    }

    // Filter only Pending invoices for approvals page? 
    // Usually approvals page shows pending, but maybe history too. 
    // The previous mock showed all but let you act on Pending.
    // Let's keep showing all for context but actions only on Pending.
    const sortedInvoices = invoices ? [...invoices].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) : [];

    return (
        <div className="space-y-4">
            <div className="border-b pb-4">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">Approvals</h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Review and process invoice requests.
                </p>
            </div>

            <div className="rounded border bg-card/50">
                <Table>
                    <TableHeader>
                        <TableRow className="h-9 hover:bg-transparent">
                            <TableHead className="w-[100px] h-9 text-xs font-semibold">ID</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Employee</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Vendor</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Amount</TableHead>
                            <TableHead className="h-9 text-xs font-semibold">Status</TableHead>
                            <TableHead className="h-9 text-xs font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!sortedInvoices || sortedInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedInvoices.map((invoice) => (
                                <TableRow key={invoice.id} className="h-10">
                                    <TableCell className="font-medium text-xs dark:text-gray-300">#{invoice.id}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{invoice.username}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{invoice.vendorName}</TableCell>
                                    <TableCell className="text-xs font-medium dark:text-gray-300">${invoice.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                invoice.status === 'Approved'
                                                    ? 'h-5 bg-green-50 text-green-700 border-green-200 hover:bg-green-50 px-2 text-[10px] uppercase tracking-wide font-semibold'
                                                    : invoice.status === 'Rejected'
                                                        ? 'h-5 bg-red-50 text-red-700 border-red-200 hover:bg-red-50 px-2 text-[10px] uppercase tracking-wide font-semibold'
                                                        : 'h-5 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 px-2 text-[10px] uppercase tracking-wide font-semibold'
                                            }
                                        >
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {invoice.status === 'Pending' && (
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleAction(invoice.id, 'Approved')}
                                                    title="Approve"
                                                    disabled={isUpdating}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleAction(invoice.id, 'Rejected')}
                                                    title="Reject"
                                                    disabled={isUpdating}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
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
