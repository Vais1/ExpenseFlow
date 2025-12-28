"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateExpenseForm } from "@/components/expenses/create-expense-form";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import {
  useMyExpenses,
  useCreateExpense,
  useUpdateExpense,
  useWithdrawExpense,
} from "@/lib/hooks/use-expenses";
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/layout/sidebar";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { ExpenseClaim } from "@/types/schema";

/**
 * Expenses page component
 * Displays expense claims table and allows creating new claims via dialog
 */
export default function ExpensesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: expenses = [], isLoading, error } = useMyExpenses();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const withdrawExpenseMutation = useWithdrawExpense();
  const [editingExpense, setEditingExpense] = useState<ExpenseClaim | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleFormSubmit = async (data: {
    amount: number;
    category: string;
    description: string;
    dateIncurred: string;
  }) => {
    try {
      if (editingExpense) {
        // Update existing expense
        await updateExpenseMutation.mutateAsync({
          expenseId: editingExpense.id,
          ...data,
        });
        toast.success("Expense updated successfully");
      } else {
        // Create new expense
        await createExpenseMutation.mutateAsync(data);
        toast.success("Expense submitted successfully");
      }
      setIsDialogOpen(false);
      setEditingExpense(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit expense. Please try again."
      );
    }
  };

  const handleEdit = (expense: ExpenseClaim) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleWithdraw = async (expenseId: string) => {
    if (!confirm("Are you sure you want to withdraw this expense?")) {
      return;
    }

    try {
      await withdrawExpenseMutation.mutateAsync(expenseId);
      toast.success("Expense withdrawn successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to withdraw expense. Please try again."
      );
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-auto">
        <div className="flex h-full flex-col space-y-6 p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Expenses</h1>
              <p className="text-sm text-muted-foreground">
                Manage your expense claims and track their status
              </p>
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setEditingExpense(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                  New Claim
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? "Edit Expense Claim" : "Create New Expense Claim"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingExpense
                      ? "Update the details of your expense claim below."
                      : "Enter the details for your new expense claim."}
                  </DialogDescription>
                </DialogHeader>
                <CreateExpenseForm
                  onSubmit={handleFormSubmit}
                  initialData={
                    editingExpense
                      ? {
                        amount: editingExpense.amount,
                        category: editingExpense.category as any,
                        description: editingExpense.description,
                        date: editingExpense.dateIncurred
                          ? new Date(editingExpense.dateIncurred)
                            .toISOString()
                            .split("T")[0]
                          : typeof editingExpense.date === "string"
                            ? editingExpense.date.split("T")[0]
                            : new Date(editingExpense.date).toISOString().split("T")[0],
                      }
                      : undefined
                  }
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Table Section */}
          <div className="flex-1 rounded-lg border border-border bg-card">
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : error ? (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-destructive">
                    Failed to load expenses. Please try again.
                  </p>
                </div>
              ) : (
                <ExpensesTable
                  data={expenses.map((exp) => ({
                    id: exp.id,
                    userId: exp.userId,
                    amount: exp.amount,
                    category: exp.category,
                    description: exp.description,
                    date: exp.dateIncurred || exp.createdAt || new Date().toISOString(),
                    dateIncurred: exp.dateIncurred,
                    status: exp.status,
                    rejectionReason: exp.rejectionReason,
                    createdAt: exp.createdAt,
                  }))}
                  showActions={true}
                  onEdit={handleEdit}
                  onWithdraw={handleWithdraw}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

