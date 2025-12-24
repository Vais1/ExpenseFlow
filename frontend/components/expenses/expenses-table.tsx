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
import type { ExpenseClaim, ExpenseStatus } from "@/types/schema";

interface ExpensesTableProps {
  /** Array of expense claims to display */
  data: ExpenseClaim[];
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
const getColumns = (): ColumnDef<ExpenseClaim>[] => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return <div className="text-sm">{formatDate(row.original.date)}</div>;
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

/**
 * Expenses Table component
 * Displays expense claims in a sortable and filterable table
 */
export const ExpensesTable: React.FC<ExpensesTableProps> = ({ data }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = getColumns();

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

