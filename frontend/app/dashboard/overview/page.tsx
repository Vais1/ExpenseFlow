'use client';

import { useDashboardStats } from '@/hooks/use-invoices';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, DollarSign, Undo2 } from 'lucide-react';

export default function DashboardOverviewPage() {
    const { data: stats, isLoading, error } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner className="h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex h-64 items-center justify-center text-destructive text-sm">
                Failed to load dashboard data.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center dark:bg-emerald-900/30">
                            <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">${stats.approvedAmount.toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {stats.approvedCount} approved
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center dark:bg-amber-900/30">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">{stats.pendingCount}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            ${stats.pendingAmount.toFixed(2)} value
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">{stats.approvedCount}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {stats.totalInvoices > 0 ? ((stats.approvedCount / stats.totalInvoices) * 100).toFixed(0) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/30">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">{stats.rejectedCount}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {stats.totalInvoices > 0 ? ((stats.rejectedCount / stats.totalInvoices) * 100).toFixed(0) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-6">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Withdrawn</CardTitle>
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                            <Undo2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                        <div className="text-2xl font-bold tracking-tight">{stats.withdrawnCount}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            By users
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
