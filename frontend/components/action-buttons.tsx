"use client";

import { useState } from "react";
import { useUpdateInvoiceStatus } from "@/hooks/use-invoices";
import { InvoiceStatus } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

interface ActionButtonsProps {
    invoiceId: number;
    currentStatus: InvoiceStatus | number;
}

export function ActionButtons({ invoiceId, currentStatus }: ActionButtonsProps) {
    const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
    const updateStatusMutation = useUpdateInvoiceStatus();

    // Only show buttons for Pending invoices
    if (currentStatus !== InvoiceStatus.Pending && currentStatus !== 0) {
        return null;
    }

    const handleApprove = () => {
        setActionType("approve");
        updateStatusMutation.mutate(
            { id: invoiceId, status: InvoiceStatus.Approved },
            {
                onSettled: () => setActionType(null),
            }
        );
    };

    const handleReject = () => {
        setActionType("reject");
        updateStatusMutation.mutate(
            { id: invoiceId, status: InvoiceStatus.Rejected },
            {
                onSettled: () => setActionType(null),
            }
        );
    };

    const isProcessing = updateStatusMutation.isPending;

    return (
        <div className="flex items-center gap-1">
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                onClick={handleApprove}
                disabled={isProcessing}
                title="Approve"
            >
                {isProcessing && actionType === "approve" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Check className="h-4 w-4" />
                )}
            </Button>
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={handleReject}
                disabled={isProcessing}
                title="Reject"
            >
                {isProcessing && actionType === "reject" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <X className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
