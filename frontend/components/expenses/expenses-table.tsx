"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ExpenseClaim, ExpenseStatus } from "@/types/schema";

interface ExpensesTableProps {
  /** Array of expense claims to display */
  data: ExpenseClaim[];
  /** Whether to show action buttons (edit/withdraw) for pending expenses */
  showActions?: boolean;
  /** Callback when edit is clicked */
  onEdit?: (expense: ExpenseClaim) => void;
  /** Callback when withdraw is clicked */
  onWithdraw?: (expenseId: string) => void;
}

/**
 * Get badge variant and styling based on expense status
 */
const getStatusBadgeVariant = (status: ExpenseStatus): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} => {
  switch (status) {
    case "Pending":
      return {
        variant: "outline",
        className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      };
    case "Approved":
      return {
        variant: "outline",
        className: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
      };
    case "Rejected":
      return {
        variant: "destructive",
        className: "",
      };
    case "Withdrawn":
      return {
        variant: "secondary",
        className: "border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-400",
      };
    default:
      return {
        variant: "outline",
        className: "",
      };
  }
};

/**
 * Format currency amount
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

/**
 * Format date string or Date object
 */
const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  } catch {
    return "Invalid date";
  }
};

/**
 * Define table columns for expense claims
 */
const getColumns = (
  showActions?: boolean,
  onEdit?: (expense: ExpenseClaim) => void,
  onWithdraw?: (expenseId: string) => void
): ColumnDef<ExpenseClaim>[] => {
  const columns: ColumnDef<ExpenseClaim>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.dateIncurred || row.original.date;
      return <div className="text-sm">{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return (
        <div className="text-sm font-medium">{row.original.category}</div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-md truncate text-sm text-muted-foreground">
          {row.original.description}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return (
        <div className="text-sm font-semibold">
          {formatCurrency(row.original.amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return <div className="text-sm text-muted-foreground">-</div>;
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(date)}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const { variant, className } = getStatusBadgeVariant(status);
      return (
        <Badge variant={variant} className={className}>
          {status}
        </Badge>
      );
    },
  },
  ];

  // Add actions column if enabled
  if (showActions && (onEdit || onWithdraw)) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const expense = row.original;
        if (expense.status !== "Pending") {
          return null;
        }

        return (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(expense)}
              >
                Edit
              </Button>
            )}
            {onWithdraw && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onWithdraw(expense.id)}
              >
                Withdraw
              </Button>
            )}
          </div>
        );
      },
    });
  }

  return columns;
};

/**
 * Expenses Table component
 * Displays expense claims in a sortable and filterable table
 */
export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  data,
  showActions = false,
  onEdit,
  onWithdraw,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = getColumns(showActions, onEdit, onWithdraw);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-border bg-muted/50"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                No expenses found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border transition-colors hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

