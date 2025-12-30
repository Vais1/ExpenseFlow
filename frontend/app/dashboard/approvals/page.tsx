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

interface ApprovalInvoice {
    id: string;
    employee: string;
    vendor: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

const INITIAL_DATA: ApprovalInvoice[] = [
    {
        id: 'REQ-101',
        employee: 'Alice Smith',
        vendor: 'Dell',
        amount: 1299.00,
        status: 'Pending',
    },
    {
        id: 'REQ-102',
        employee: 'Bob Jones',
        vendor: 'Staples',
        amount: 54.20,
        status: 'Pending',
    },
    {
        id: 'REQ-103',
        employee: 'Charlie Day',
        vendor: 'Microsoft',
        amount: 899.99,
        status: 'Approved',
    },
    {
        id: 'REQ-104',
        employee: 'Alice Smith',
        vendor: 'Tenaga Nasional',
        amount: 150.00,
        status: 'Rejected',
    },
    {
        id: 'REQ-105',
        employee: 'David Miller',
        vendor: 'Dell',
        amount: 2400.00,
        status: 'Pending',
    },
];

export default function ApprovalsPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<ApprovalInvoice[]>(INITIAL_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = authService.getSession();
        if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Management')) {
            router.push('/dashboard');
            return;
        }
        setLoading(false);
    }, [router]);

    const handleAction = (id: string, status: 'Approved' | 'Rejected') => {
        setInvoices((prev) =>
            prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
        );
    };

    if (loading) return null;

    return (
        <div className="space-y-4">
            <div className="border-b pb-4">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">Approvals</h1>
                <p className="text-xs text-muted-foreground mt-1">
                    Review and process pending invoice requests.
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
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id} className="h-10">
                                <TableCell className="font-medium text-xs">{invoice.id}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{invoice.employee}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{invoice.vendor}</TableCell>
                                <TableCell className="text-xs font-medium">${invoice.amount.toFixed(2)}</TableCell>
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
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleAction(invoice.id, 'Rejected')}
                                                title="Reject"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
