"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useMyExpenses, usePendingApprovals } from "@/lib/hooks/use-expenses";
import { Sidebar } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, FolderCheckIcon } from "@hugeicons/core-free-icons";
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

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { data: myExpenses = [], isLoading: expensesLoading } = useMyExpenses();
  const { data: pendingApprovals = [], isLoading: approvalsLoading } = usePendingApprovals({
    enabled: !!user && (user.role === "manager" || user.role === "admin"),
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r border-border bg-background p-4">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Calculate statistics
  const totalExpenses = myExpenses.length;
  const pendingCount = myExpenses.filter((e) => e.status === "Pending").length;
  const approvedCount = myExpenses.filter((e) => e.status === "Approved").length;
  const rejectedCount = myExpenses.filter((e) => e.status === "Rejected").length;
  const totalAmount = myExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const approvedAmount = myExpenses
    .filter((e) => e.status === "Approved")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const pendingApprovalsCount = pendingApprovals.length;

  return (
    <div className="flex h-screen">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.fullName}!
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <HugeiconsIcon icon={FileText} className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalExpenses}</div>
                <p className="text-xs text-muted-foreground">
                  All time submissions
                </p>
              </CardContent>
            </Card>

            {/* Pending Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending
                </CardTitle>
                <Badge variant="outline" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  {pendingCount}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            {/* Approved Expenses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved
                </CardTitle>
                <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                  {approvedCount}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(approvedAmount)} approved
                </p>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Amount
                </CardTitle>
                <span className="text-muted-foreground">$</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  All submitted expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Manager/Admin Specific Section */}
          {(user.role === "manager" || user.role === "admin") && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  Review and approve expense claims from employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvalsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : pendingApprovalsCount === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No pending approvals at this time
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{pendingApprovalsCount}</p>
                        <p className="text-sm text-muted-foreground">
                          Expenses awaiting your review
                        </p>
                      </div>
                      <Button asChild>
                        <Link href="/approvals">
                          <HugeiconsIcon icon={FolderCheckIcon} className="mr-2 size-4" />
                          Review Approvals
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/expenses">
                    <HugeiconsIcon icon={FileText} className="mr-2 size-4" />
                    View My Expenses
                  </Link>
                </Button>
                {(user.role === "manager" || user.role === "admin") && (
                  <Button variant="outline" asChild>
                    <Link href="/approvals">
                      <HugeiconsIcon icon={FolderCheckIcon} className="mr-2 size-4" />
                      Review Approvals
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

