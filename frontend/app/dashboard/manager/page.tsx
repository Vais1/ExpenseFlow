"use client";

import { useMemo, useState } from "react";
import { useAllInvoices } from "@/hooks/use-invoices";
import { InvoiceStatus } from "@/types/api";

// Components
import { StatusBadge, parseStatus } from "@/components/status-badge";
import { ActionButtons } from "@/components/action-buttons";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Icons
import {
    RefreshCw,
    Clock,
    CheckCircle2,
    FileText,
    DollarSign,
    XCircle,
    AlertTriangle,
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

// Filter types
type FilterOption = "all" | "pending" | "history";

export default function ManagerDashboardPage() {
    const [filter, setFilter] = useState<FilterOption>("all");

    // Data fetching
    const {
        data: invoices,
        isLoading: invoicesLoading,
        isError: invoicesError,
        refetch: refetchInvoices,
    } = useAllInvoices();

    // Calculate stats from data
    const stats = useMemo(() => {
        if (!invoices) {
            return { pending: 0, processed: 0, totalValue: 0, approved: 0, rejected: 0 };
        }

        return invoices.reduce(
            (acc, inv) => {
                const status = parseStatus(inv.status);
                if (status === InvoiceStatus.Pending) acc.pending++;
                if (status === InvoiceStatus.Approved) {
                    acc.approved++;
                    acc.processed++;
                    acc.totalValue += inv.amount;
                }
                if (status === InvoiceStatus.Rejected) {
                    acc.rejected++;
                    acc.processed++;
                }
                return acc;
            },
            { pending: 0, processed: 0, totalValue: 0, approved: 0, rejected: 0 }
        );
    }, [invoices]);

    // Filter invoices
    const filteredInvoices = useMemo(() => {
        if (!invoices) return [];

        switch (filter) {
            case "pending":
                return invoices.filter((inv) => parseStatus(inv.status) === InvoiceStatus.Pending);
            case "history":
                return invoices.filter((inv) => {
                    const status = parseStatus(inv.status);
                    return status === InvoiceStatus.Approved || status === InvoiceStatus.Rejected;
                });
            default:
                return invoices;
        }
    }, [invoices, filter]);

    return (
        <div className="p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">Invoice Approvals</h1>
                <p className="text-muted-foreground mt-1">Review and manage invoice submissions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                {/* Action Required - Prominent */}
                <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Action Required
                        </CardTitle>
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                {stats.pending}
                            </div>
                        )}
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            Pending approval
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Processed
                        </CardTitle>
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold text-foreground">{stats.processed}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.approved} approved, {stats.rejected} rejected
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Value
                        </CardTitle>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(stats.totalValue)}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Approved invoices</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Invoices
                        </CardTitle>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {invoicesLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold text-foreground">
                                {invoices?.length || 0}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoice Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <CardTitle>All Invoices</CardTitle>
                        <Select value={filter} onValueChange={(v) => setFilter(v as FilterOption)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending Only</SelectItem>
                                <SelectItem value="history">History</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchInvoices()}
                        disabled={invoicesLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${invoicesLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Loading State */}
                    {invoicesLoading && (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {invoicesError && (
                        <div className="text-center py-12">
                            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">Failed to load data</h3>
                            <p className="text-muted-foreground mb-4">
                                There was an error fetching invoices.
                            </p>
                            <Button onClick={() => refetchInvoices()}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!invoicesLoading && !invoicesError && filteredInvoices.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">No invoices found</h3>
                            <p className="text-muted-foreground">
                                {filter === "pending"
                                    ? "No pending invoices to review."
                                    : filter === "history"
                                        ? "No processed invoices yet."
                                        : "No invoices have been submitted yet."}
                            </p>
                        </div>
                    )}

                    {/* Table */}
                    {!invoicesLoading && !invoicesError && filteredInvoices.length > 0 && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInvoices.map((invoice) => {
                                        const status = parseStatus(invoice.status);

                                        return (
                                            <TableRow key={invoice.id}>
                                                <TableCell>
                                                    <StatusBadge status={status} />
                                                </TableCell>
                                                <TableCell className="font-medium">{invoice.username}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {invoice.vendorName}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(invoice.amount)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(invoice.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <ActionButtons invoiceId={invoice.id} currentStatus={status} />
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
