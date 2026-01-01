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
        <div className="space-y-6">
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">${totalApprovedAmount.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {approvedInvoices} approved
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">{pendingInvoices}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Awaiting action
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">{approvedInvoices}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {totalInvoices > 0 ? ((approvedInvoices / totalInvoices) * 100).toFixed(0) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">{rejectedInvoices}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {totalInvoices > 0 ? ((rejectedInvoices / totalInvoices) * 100).toFixed(0) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
