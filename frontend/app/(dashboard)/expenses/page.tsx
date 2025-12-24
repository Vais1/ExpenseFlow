"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateExpenseForm } from "@/components/expenses/create-expense-form";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import type { ExpenseClaim } from "@/types/schema";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/**
 * Mock expense claims data for demonstration
 */
const mockExpenseData: ExpenseClaim[] = [
  {
    id: "1",
    amount: 125.5,
    category: "Travel",
    description: "Taxi fare to client meeting",
    date: "2024-01-15",
    status: "Pending",
  },
  {
    id: "2",
    amount: 45.0,
    category: "Meals",
    description: "Business lunch with team",
    date: "2024-01-10",
    status: "Approved",
  },
  {
    id: "3",
    amount: 320.0,
    category: "Equipment",
    description: "New monitor for home office",
    date: "2024-01-05",
    status: "Approved",
  },
  {
    id: "4",
    amount: 89.99,
    category: "Office Supplies",
    description: "Printer paper and ink cartridges",
    date: "2024-01-20",
    status: "Pending",
  },
  {
    id: "5",
    amount: 150.0,
    category: "Medical",
    description: "Annual health checkup",
    date: "2024-01-12",
    status: "Rejected",
  },
];

/**
 * Expenses page component
 * Displays expense claims table and allows creating new claims via dialog
 */
export default function ExpensesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseClaim[]>(mockExpenseData);

  const handleFormSubmit = () => {
    // Close dialog after successful submission
    setIsDialogOpen(false);
    // In the future, this will refresh the expenses list from the API
  };

  return (
    <div className="flex h-full flex-col space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your expense claims and track their status
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
              New Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Expense Claim</DialogTitle>
            </DialogHeader>
            <CreateExpenseForm onSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Section */}
      <div className="flex-1 rounded-lg border border-border bg-card">
        <div className="p-6">
          <ExpensesTable data={expenses} />
        </div>
      </div>
    </div>
  );
}

