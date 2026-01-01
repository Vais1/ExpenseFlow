'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ChevronDown, ChevronUp, MessageCircle, Search } from 'lucide-react';
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
import { authService } from '@/services/auth';
import { useInvoices, useUpdateInvoiceStatus, InvoiceFilters } from '@/hooks/use-invoices';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { RejectDialog } from '@/components/reject-dialog';
import { InvoiceDetailDrawer } from '@/components/invoice-detail-drawer';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

type SortField = 'createdAt' | 'amount' | 'vendor' | 'user' | 'status';
type SortOrder = 'asc' | 'desc';

export default function ApprovalsPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerInvoiceId, setDrawerInvoiceId] = useState<number | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebouncedValue(searchInput, 300);

    // Build filters
    const filters: InvoiceFilters = useMemo(() => {
        const f: InvoiceFilters = {
            sortBy: sortField,
            sortOrder,
        };
        if (statusFilter !== 'all') {
            f.status = statusFilter === 'pending' ? 0 : statusFilter === 'approved' ? 1 : 2;
        }
        if (debouncedSearch.trim()) {
            f.search = debouncedSearch.trim();
        }
        return f;
    }, [sortField, sortOrder, statusFilter, debouncedSearch]);

    const { data: invoices, isLoading, error } = useInvoices(filters);
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateInvoiceStatus();

    useEffect(() => {
        const session = authService.getSession();
        if (!session || session.user.role !== 'Admin') {
            router.push('/dashboard');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    const handleApprove = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        updateStatus({ id, status: 'Approved' });
    };

    const handleRejectClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedInvoiceId(id);
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = (reason: string) => {
        if (selectedInvoiceId) {
            updateStatus({ id: selectedInvoiceId, status: 'Rejected', rejectionReason: reason });
            setRejectDialogOpen(false);
            setSelectedInvoiceId(null);
        }
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

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? (
            <ChevronUp className="h-3 w-3 ml-1 inline" />
        ) : (
            <ChevronDown className="h-3 w-3 ml-1 inline" />
        );
    };

    if (!isAuthorized) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground">Approvals</h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search vendor, user..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8 h-8 w-[180px] text-xs"
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
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <TableSkeleton columns={6} rows={5} />
            ) : error ? (
                <div className="flex h-64 items-center justify-center text-destructive text-sm">
                    Failed to load approvals. Please try again.
                </div>
            ) : (
                <div className="rounded border bg-card/50">
                    <Table>
                        <TableHeader>
                            <TableRow className="h-9 hover:bg-transparent">
                                <TableHead className="w-[80px] h-9 text-xs font-semibold">ID</TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('user')}
                                >
                                    Employee <SortIcon field="user" />
                                </TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('vendor')}
                                >
                                    Vendor <SortIcon field="vendor" />
                                </TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount <SortIcon field="amount" />
                                </TableHead>
                                <TableHead
                                    className="h-9 text-xs font-semibold cursor-pointer select-none"
                                    onClick={() => handleSort('status')}
                                >
                                    Status <SortIcon field="status" />
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
                                            : statusFilter === 'pending'
                                                ? 'No pending invoices. All caught up!'
                                                : 'No invoices found.'}
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
                                        <TableCell className="text-xs text-muted-foreground">{invoice.username}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{invoice.vendorName}</TableCell>
                                        <TableCell className="text-xs font-medium dark:text-gray-300">${invoice.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
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
                                                {invoice.status === 'Rejected' && invoice.rejectionReason && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="max-w-[250px] text-xs">
                                                                <p className="font-medium mb-1">Rejection Reason:</p>
                                                                <p>{invoice.rejectionReason}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {invoice.status === 'Pending' && (
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={(e) => handleApprove(invoice.id, e)}
                                                        title="Approve"
                                                        disabled={isUpdating}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={(e) => handleRejectClick(invoice.id, e)}
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
            )}

            <RejectDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                onConfirm={handleRejectConfirm}
                invoiceId={selectedInvoiceId ?? 0}
                isPending={isUpdating}
            />

            <InvoiceDetailDrawer
                invoiceId={drawerInvoiceId}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
            />
        </div>
    );
}
