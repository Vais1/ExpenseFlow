"use client";

import { useMemo, useState } from "react";
import { useMyInvoices, useDeleteInvoice } from "@/hooks/use-invoices";
import { InvoiceStatus } from "@/types/api";

// Components
import { StatusBadge, parseStatus } from "@/components/status-badge";
import { CreateInvoiceDialog } from "@/components/create-invoice-dialog";

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Icons
import {
    FileText,
    Trash2,
    RefreshCw,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    FileQuestion,
} from "lucide-react";

// Date formatting
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// Currency formatting
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

// Invoice ID formatting
function formatInvoiceId(id: number): string {
    return `#${id.toString().padStart(3, "0")}`;
}

export default function CustomerDashboardPage() {
    // Data fetching
    const {
        data: invoices,
        isLoading: invoicesLoading,
        isError: invoicesError,
        refetch: refetchInvoices,
    } = useMyInvoices();

    const deleteMutation = useDeleteInvoice();

    // Calculate stats from data
    const stats = useMemo(() => {
        if (!invoices)
            return { total: 0, approved: 0, pending: 0, rejected: 0 };

        return invoices.reduce(
            (acc, inv) => {
                const status = parseStatus(inv.status);
                acc.total++;
                if (status === InvoiceStatus.Approved) acc.approved++;
                if (status === InvoiceStatus.Pending) acc.pending++;
                if (status === InvoiceStatus.Rejected) acc.rejected++;
                return acc;
            },
            { total: 0, approved: 0, pending: 0, rejected: 0 }
        );
    }, [invoices]);

    // Handle delete
    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this invoice?")) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your invoice requests
                    </p>
                </div>
                <CreateInvoiceDialog />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Requests
                        </CardTitle>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold text-foreground">
                                {stats.total}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Approved
                        </CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats.approved}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pending
                        </CardTitle>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {stats.pending}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Invoices</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchInvoices()}
                        disabled={invoicesLoading}
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${invoicesLoading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Loading State */}
                    {invoicesLoading && (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {invoicesError && (
                        <div className="text-center py-12">
                            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Failed to load data
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                There was an error fetching your invoices.
                            </p>
                            <Button onClick={() => refetchInvoices()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!invoicesLoading && !invoicesError && invoices?.length === 0 && (
                        <div className="text-center py-12">
                            <FileQuestion className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                No invoices yet
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Create your first invoice request to get started.
                            </p>
                            <CreateInvoiceDialog>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Request
                                </Button>
                            </CreateInvoiceDialog>
                        </div>
                    )}

                    {/* Table */}
                    {!invoicesLoading && !invoicesError && invoices && invoices.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => {
                                        const status = parseStatus(invoice.status);
                                        const isApproved = status === InvoiceStatus.Approved;

                                        return (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium text-muted-foreground">
                                                    {formatInvoiceId(invoice.id)}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {invoice.vendorName}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(invoice.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(invoice.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={status} />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(invoice.id)}
                                                        disabled={isApproved || deleteMutation.isPending}
                                                        title={
                                                            isApproved
                                                                ? "Cannot delete approved invoices"
                                                                : "Delete invoice"
                                                        }
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
