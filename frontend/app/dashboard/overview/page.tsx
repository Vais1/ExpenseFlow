'use client';

import { useInvoices } from '@/hooks/use-invoices';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

export default function DashboardOverviewPage() {
    const { data: invoices, isLoading, error } = useInvoices();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner className="h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error || !invoices) {
        return (
            <div className="flex h-64 items-center justify-center text-destructive text-sm">
                Failed to load dashboard data.
            </div>
        );
    }

    // Calculate Stats
    const totalInvoices = invoices.length;
    const pendingInvoices = invoices.filter(i => i.status === 'Pending').length;
    const approvedInvoices = invoices.filter(i => i.status === 'Approved').length;
    const rejectedInvoices = invoices.filter(i => i.status === 'Rejected').length;

    // Calculate Total Approved Amount
    const totalApprovedAmount = invoices
        .filter(i => i.status === 'Approved')
        .reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="space-y-4">
            <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalApprovedAmount.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {approvedInvoices} approved
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingInvoices}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting action
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{approvedInvoices}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalInvoices > 0 ? ((approvedInvoices / totalInvoices) * 100).toFixed(0) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rejectedInvoices}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalInvoices > 0 ? ((rejectedInvoices / totalInvoices) * 100).toFixed(0) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
