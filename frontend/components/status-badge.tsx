import { InvoiceStatus } from "@/types/api";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: InvoiceStatus | number;
    className?: string;
}

const statusConfig: Record<
    number,
    { label: string; className: string }
> = {
    [InvoiceStatus.Pending]: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    [InvoiceStatus.Approved]: {
        label: "Approved",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    [InvoiceStatus.Rejected]: {
        label: "Rejected",
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig[InvoiceStatus.Pending];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className,
                className
            )}
        >
            {config.label}
        </span>
    );
}

// Helper to parse status from string (backend returns string)
export function parseStatus(status: string | number): InvoiceStatus {
    if (typeof status === "number") return status;

    switch (status.toLowerCase()) {
        case "pending":
            return InvoiceStatus.Pending;
        case "approved":
            return InvoiceStatus.Approved;
        case "rejected":
            return InvoiceStatus.Rejected;
        default:
            return InvoiceStatus.Pending;
    }
}
