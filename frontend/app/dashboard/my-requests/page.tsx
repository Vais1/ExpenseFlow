'use client';

import { useState } from 'react';
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
import {
    CreateInvoiceDialog,
    Invoice,
} from '@/components/create-invoice-dialog';

// Initial Mock Data
const INITIAL_INVOICES: Invoice[] = [
    {
        id: 'INV-001',
        vendor: 'Dell',
        date: '2025-05-15',
        amount: 1299.99,
        status: 'Approved',
    },
    {
        id: 'INV-002',
        vendor: 'Staples',
        date: '2025-05-18',
        amount: 245.50,
        status: 'Pending',
    },
    {
        id: 'INV-003',
        vendor: 'Microsoft',
        date: '2025-05-20',
        amount: 89.99,
        status: 'Rejected',
    },
    {
        id: 'INV-004',
        vendor: 'Tenaga Nasional',
        date: '2025-05-22',
        amount: 450.00,
        status: 'Pending',
    },
    {
        id: 'INV-005',
        vendor: 'Dell',
        date: '2025-05-25',
        amount: 3200.00,
        status: 'Approved',
    },
];

export default function MyRequestsPage() {
    const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

    const handleDelete = (id: string) => {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    };

    const handleCreate = (newInvoice: Invoice) => {
        setInvoices((prev) => [newInvoice, ...prev]);
    };

    const getStatusBadge = (status: Invoice['status']) => {
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">My Requests</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                        Manage your invoice requests and view their status.
                    </p>
                </div>
                <CreateInvoiceDialog onSuccess={handleCreate} />
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
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id} className="h-10">
                                    <TableCell className="font-medium text-xs">{invoice.id}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{invoice.vendor}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{invoice.date}</TableCell>
                                    <TableCell className="text-xs font-medium">${invoice.amount.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(invoice.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
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
