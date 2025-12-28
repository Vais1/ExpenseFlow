"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePendingApprovals, useUpdateExpenseStatus } from "@/lib/hooks/use-expenses";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { ExpenseStatus } from "@/types/schema";
import { CheckmarkCircleIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
 * Format date
 */
const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(dateObj);
  } catch {
    return "Invalid date";
  }
};

/**
 * Manager Approvals Page
 * Allows managers to review and approve/reject pending expense claims
 */
export default function ApprovalsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { data: pendingExpenses = [], isLoading, error } = usePendingApprovals();
  const updateStatusMutation = useUpdateExpenseStatus();
  const [selectedExpense, setSelectedExpense] = useState<{
    id: string;
    status: ExpenseStatus;
    reason?: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Redirect if not manager/admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && user.role !== "manager" && user.role !== "admin"))) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || (user.role !== "manager" && user.role !== "admin")) {
    return null;
  }

  const handleApprove = async (expenseId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        expenseId,
        status: "Approved",
      });
      toast.success("Expense approved successfully");
      setSelectedExpense(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve expense"
      );
    }
  };

  const handleReject = async () => {
    if (!selectedExpense) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        expenseId: selectedExpense.id,
        status: "Rejected",
        reason: rejectionReason,
      });
      toast.success("Expense rejected");
      setSelectedExpense(null);
      setRejectionReason("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject expense"
      );
    }
  };

  const openRejectDialog = (expenseId: string) => {
    setSelectedExpense({ id: expenseId, status: "Rejected" });
    setRejectionReason("");
  };

  return (
    <div className="flex h-screen">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-auto">
        <div className="flex h-full flex-col space-y-6 p-6">
          {/* Header Section */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Pending Approvals
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and approve or reject expense claims
            </p>
          </div>

          {/* Content Section */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-destructive">
                Failed to load pending approvals. Please try again.
              </p>
            </div>
          ) : pendingExpenses.length === 0 ? (
            <Card>
              <CardContent className="flex h-64 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No pending approvals at this time
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingExpenses.map((expense) => (
                <Card key={expense.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {formatCurrency(expense.amount)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {expense.category}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {expense.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Date: {formatDate(expense.dateIncurred)}</span>
                      <span>Submitted: {formatDate(expense.createdAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApprove(expense.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <HugeiconsIcon icon={CheckmarkCircleIcon} className="mr-2 size-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => openRejectDialog(expense.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="mr-2 size-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Rejection Dialog */}
          <Dialog
            open={selectedExpense?.status === "Rejected"}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedExpense(null);
                setRejectionReason("");
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Expense</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this expense claim.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Rejection Reason</label>
                  <Textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedExpense(null);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || updateStatusMutation.isPending}
                >
                  Reject Expense
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

