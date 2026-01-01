'use client';

import { format, formatDistanceToNow } from 'date-fns';
import {
    FileText,
    Check,
    X,
    Edit,
    Trash2,
    Clock,
    User,
    Building2,
    DollarSign,
    Loader2
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoice, useInvoiceActivity } from '@/hooks/use-invoices';
import { InvoiceActivityAction } from '@/lib/types';

interface InvoiceDetailDrawerProps {
    invoiceId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const actionIcons: Record<InvoiceActivityAction, React.ReactNode> = {
    Created: <FileText className="h-3.5 w-3.5 text-blue-500" />,
    Approved: <Check className="h-3.5 w-3.5 text-green-500" />,
    Rejected: <X className="h-3.5 w-3.5 text-red-500" />,
    Updated: <Edit className="h-3.5 w-3.5 text-orange-500" />,
    Deleted: <Trash2 className="h-3.5 w-3.5 text-gray-500" />,
};

const actionColors: Record<InvoiceActivityAction, string> = {
    Created: 'bg-blue-100 border-blue-200',
    Approved: 'bg-green-100 border-green-200',
    Rejected: 'bg-red-100 border-red-200',
    Updated: 'bg-orange-100 border-orange-200',
    Deleted: 'bg-gray-100 border-gray-200',
};

export function InvoiceDetailDrawer({ invoiceId, open, onOpenChange }: InvoiceDetailDrawerProps) {
    const { data: invoice, isLoading: invoiceLoading } = useInvoice(invoiceId ?? 0);
    const { data: activities, isLoading: activityLoading } = useInvoiceActivity(invoiceId ?? 0);

    const getStatusBadge = (status: string) => {
        const baseClasses = 'h-5 px-2 text-[10px] uppercase tracking-wide font-semibold';
        switch (status) {
            case 'Approved':
                return <Badge variant="outline" className={`${baseClasses} bg-green-50 text-green-700 border-green-200`}>Approved</Badge>;
            case 'Rejected':
                return <Badge variant="outline" className={`${baseClasses} bg-red-50 text-red-700 border-red-200`}>Rejected</Badge>;
            default:
                return <Badge variant="outline" className={`${baseClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>Pending</Badge>;
        }
    };

    const parseMetadata = (metadata: string | null | undefined) => {
        if (!metadata) return null;
        try {
            return JSON.parse(metadata);
        } catch {
            return null;
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[420px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="text-sm font-semibold">
                        Invoice #{invoiceId}
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                        View invoice details and activity history
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-80px)]">
                    <div className="p-4 space-y-4">
                        {/* Invoice Details */}
                        {invoiceLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ) : invoice ? (
                            <div className="space-y-4">
                                {/* Amount Card */}
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            Amount
                                        </div>
                                        {getStatusBadge(invoice.status)}
                                    </div>
                                    <div className="text-2xl font-semibold mt-1">${invoice.amount.toFixed(2)}</div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="space-y-1">
                                        <div className="text-muted-foreground flex items-center gap-1.5">
                                            <User className="h-3 w-3" /> Submitted by
                                        </div>
                                        <div className="font-medium">{invoice.username}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-muted-foreground flex items-center gap-1.5">
                                            <Building2 className="h-3 w-3" /> Vendor
                                        </div>
                                        <div className="font-medium">{invoice.vendorName}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-muted-foreground flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" /> Created
                                        </div>
                                        <div className="font-medium">{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-muted-foreground">Category</div>
                                        <div className="font-medium">{invoice.vendorCategory}</div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-1 text-xs">
                                    <div className="text-muted-foreground">Description</div>
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 border text-sm">
                                        {invoice.description}
                                    </div>
                                </div>

                                {/* Rejection Reason */}
                                {invoice.status === 'Rejected' && invoice.rejectionReason && (
                                    <div className="space-y-1 text-xs">
                                        <div className="text-destructive font-medium">Rejection Reason</div>
                                        <div className="bg-red-50 dark:bg-red-950 rounded p-2 border border-red-200 text-sm text-red-700 dark:text-red-300">
                                            {invoice.rejectionReason}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-xs text-muted-foreground py-8">
                                Invoice not found
                            </div>
                        )}

                        <Separator />

                        {/* Activity Timeline */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Activity Timeline
                            </h3>

                            {activityLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <div className="flex-1 space-y-1">
                                                <Skeleton className="h-3 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : activities && activities.length > 0 ? (
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

                                    <div className="space-y-3">
                                        {activities.map((activity, index) => {
                                            const meta = parseMetadata(activity.metadata);
                                            return (
                                                <div key={activity.id} className="relative flex gap-3 pl-1">
                                                    {/* Timeline dot */}
                                                    <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border ${actionColors[activity.action as InvoiceActivityAction] || 'bg-gray-100 border-gray-200'}`}>
                                                        {actionIcons[activity.action as InvoiceActivityAction] || <Clock className="h-3.5 w-3.5" />}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0 pb-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium">{activity.action}</span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                                            by {activity.performedByUsername} ({activity.performedByRole})
                                                        </div>

                                                        {/* Show rejection reason in metadata */}
                                                        {activity.action === 'Rejected' && meta?.rejectionReason && (
                                                            <div className="mt-1 text-[10px] text-red-600 bg-red-50 rounded px-2 py-1">
                                                                Reason: {meta.rejectionReason}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-xs text-muted-foreground py-4">
                                    No activity recorded yet
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
