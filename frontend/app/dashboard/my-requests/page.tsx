'use client';

import { useState, useMemo } from 'react';
import { Trash2, ChevronDown, ChevronUp, MessageCircle, Search, Pencil, Undo2, Copy, FileText, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { CreateInvoiceDialog } from '@/components/create-invoice-dialog';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { InvoiceDetailDrawer } from '@/components/invoice-detail-drawer';
import { EditInvoiceDialog } from '@/components/edit-invoice-dialog';
import { useInvoices, useDeleteInvoice, useWithdrawInvoice, useUserStats, InvoiceFilters } from '@/hooks/use-invoices';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { format } from 'date-fns';
import { Invoice } from '@/lib/types';

type SortField = 'createdAt' | 'amount' | 'vendor' | 'status';
type SortOrder = 'asc' | 'desc';

const SortIcon = ({ field, currentSort, sortOrder }: { field: SortField; currentSort: SortField; sortOrder: SortOrder }) => {
    if (currentSort !== field) return null;
    return sortOrder === 'asc' ? (
        <ChevronUp className="h-3 w-3 ml-1 inline" />
    ) : (
        <ChevronDown className="h-3 w-3 ml-1 inline" />
    );
};

export default function MyRequestsPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerInvoiceId, setDrawerInvoiceId] = useState<number | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebouncedValue(searchInput, 300);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [duplicateInvoice, setDuplicateInvoice] = useState<Invoice | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Fetch user's personal stats
    const { data: userStats, isLoading: statsLoading } = useUserStats();

    // Build filters
    const filters: InvoiceFilters = useMemo(() => {
        const f: InvoiceFilters = {
            sortBy: sortField,
            sortOrder,
        };
        if (statusFilter !== 'all') {
            const statusMap: Record<string, number> = { pending: 0, approved: 1, rejected: 2, withdrawn: 3 };
            f.status = statusMap[statusFilter];
        }
        if (debouncedSearch.trim()) {
            f.search = debouncedSearch.trim();
        }
        return f;
    }, [sortField, sortOrder, statusFilter, debouncedSearch]);

    const { data: invoices, isLoading, error } = useInvoices(filters);
    const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
    const { mutate: withdrawInvoice, isPending: isWithdrawing } = useWithdrawInvoice();

    const handleDeleteClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedInvoiceId(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedInvoiceId) {
            deleteInvoice(selectedInvoiceId);
            setDeleteDialogOpen(false);
            setSelectedInvoiceId(null);
        }
    };

    const handleEditClick = (invoice: Invoice, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingInvoice(invoice);
        setEditDialogOpen(true);
    };

    const handleWithdrawClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        withdrawInvoice(id);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const handleRowClick = (id: number) => {
        setDrawerInvoiceId(id);
        setDrawerOpen(true);
    };



    const getStatusBadge = (status: string, rejectionReason?: string | null) => {
        const statusStyles: Record<string, string> = {
            Approved: 'h-5 bg-green-50 text-green-700 border-green-200 hover:bg-green-50 px-2 text-[10px] uppercase tracking-wide font-semibold dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            Rejected: 'h-5 bg-red-50 text-red-700 border-red-200 hover:bg-red-50 px-2 text-[10px] uppercase tracking-wide font-semibold dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
            Pending: 'h-5 bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50 px-2 text-[10px] uppercase tracking-wide font-semibold dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
            Withdrawn: 'h-5 bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100 px-2 text-[10px] uppercase tracking-wide font-semibold dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        };

        const badge = (
            <Badge
                variant="outline"
                className={statusStyles[status] || statusStyles.Pending}
            >
                {status}
            </Badge>
        );

        if (status === 'Rejected' && rejectionReason) {
            return (
                <div className="flex items-center gap-1.5">
                    {badge}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-[250px] text-xs">
                                <p className="font-medium mb-1">Rejection Reason:</p>
                                <p>{rejectionReason}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        }

        return badge;
    };

    return (
        <div className="space-y-4">
            {/* Personal Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="bg-card/50">
                            <CardContent className="p-4">
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-6 w-12" />
                            </CardContent>
                        </Card>
                    ))
                ) : userStats ? (
                    <>
                        <Card className="bg-card/50 border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span>Total Submitted</span>
                                </div>
                                <div className="text-xl font-bold mt-1">{userStats.totalSubmitted}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-xs">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Pending</span>
                                </div>
                                <div className="text-xl font-bold mt-1">{userStats.pendingCount}</div>
                                <div className="text-[10px] text-muted-foreground">${userStats.pendingAmount.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-xs">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Approved</span>
                                </div>
                                <div className="text-xl font-bold mt-1">{userStats.approvedCount}</div>
                                <div className="text-[10px] text-muted-foreground">${userStats.totalApprovedAmount.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-500 text-xs">
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Rejected</span>
                                </div>
                                <div className="text-xl font-bold mt-1">{userStats.rejectedCount}</div>
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>

            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">My Requests</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search vendor..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8 h-8 w-[150px] text-xs"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">All Status</SelectItem>
                            <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                            <SelectItem value="approved" className="text-xs">Approved</SelectItem>
                            <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
                            <SelectItem value="withdrawn" className="text-xs">Withdrawn</SelectItem>
                        </SelectContent>
                    </Select>
                    <CreateInvoiceDialog />
                </div>
            </div>

            {isLoading ? (
                <TableSkeleton columns={6} rows={5} />
            ) : error ? (
                <div className="flex h-64 items-center justify-center text-destructive text-sm">
                    Failed to load requests. Please try again.
                </div>
            ) : (
                <div className="rounded border bg-card/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="h-9 hover:bg-transparent">
                                <TableHead className="w-[80px] h-9 text-xs font-semibold">ID</TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('vendor')}
                                >
                                    Vendor <SortIcon field="vendor" currentSort={sortField} sortOrder={sortOrder} />
                                </TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Date <SortIcon field="createdAt" currentSort={sortField} sortOrder={sortOrder} />
                                </TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount <SortIcon field="amount" currentSort={sortField} sortOrder={sortOrder} />
                                </TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    Status <SortIcon field="status" currentSort={sortField} sortOrder={sortOrder} />
                                </TableHead>
                                <TableHead className="h-9 text-xs font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!invoices || invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                                        {debouncedSearch
                                            ? 'No invoices match your search.'
                                            : statusFilter === 'all'
                                                ? 'No requests yet. Create your first invoice request →'
                                                : 'No matching requests found.'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                invoices.map((invoice) => (
                                    <TableRow
                                        key={invoice.id}
                                        className="h-10 cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleRowClick(invoice.id)}
                                    >
                                        <TableCell className="font-medium text-xs dark:text-gray-300">#{invoice.id}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{invoice.vendorName}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-xs font-medium dark:text-gray-300">${invoice.amount.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(invoice.status, invoice.rejectionReason)}</TableCell>
                                        <TableCell className="text-right">
                                            {invoice.status === 'Pending' ? (
                                                <div className="flex justify-end gap-1">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground/70 hover:text-primary hover:bg-primary/10"
                                                                    onClick={(e) => handleEditClick(invoice, e)}
                                                                    title="Edit Invoice"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs">Edit</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground/70 hover:text-amber-600 hover:bg-amber-50"
                                                                    onClick={(e) => handleWithdrawClick(invoice.id, e)}
                                                                    disabled={isWithdrawing}
                                                                    title="Withdraw Invoice"
                                                                >
                                                                    <Undo2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs">Withdraw</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={(e) => handleDeleteClick(invoice.id, e)}
                                                                    disabled={isDeleting}
                                                                    title="Delete Invoice"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground/30 cursor-not-allowed"
                                                                disabled
                                                            >
                                                                <XCircle className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            {invoice.status === 'Withdrawn' ? 'Invoice was withdrawn' : 'Only pending invoices can be modified'}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
                title="Delete Invoice"
                description="Are you sure you want to delete this invoice? This action cannot be undone."
                isPending={isDeleting}
            />

            <EditInvoiceDialog
                invoice={editingInvoice}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />

            <InvoiceDetailDrawer
                invoiceId={drawerInvoiceId}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
        </div>
    );
}
