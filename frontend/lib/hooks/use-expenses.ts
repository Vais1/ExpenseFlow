import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  getMyExpenses,
  getPendingApprovals,
  updateExpenseStatus,
  updateExpense as updateExpenseApi,
  withdrawExpense,
  type CreateExpenseRequest,
  type UpdateExpenseStatusRequest,
} from "@/lib/api/expenses";

/**
 * Query key factory for expenses
 */
export const expenseKeys = {
  all: ["expenses"] as const,
  myExpenses: () => [...expenseKeys.all, "my"] as const,
  pending: () => [...expenseKeys.all, "pending"] as const,
};

/**
 * Hook to get current user's expenses
 */
export function useMyExpenses() {
  return useQuery({
    queryKey: expenseKeys.myExpenses(),
    queryFn: getMyExpenses,
  });
}

/**
 * Hook to get pending approvals (Manager only)
 */
export function usePendingApprovals(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: expenseKeys.pending(),
    queryFn: getPendingApprovals,
    enabled: options?.enabled,
  });
}

/**
 * Hook to create a new expense
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data),
    onSuccess: () => {
      // Invalidate and refetch expenses
      queryClient.invalidateQueries({ queryKey: expenseKeys.myExpenses() });
    },
  });
}

/**
 * Hook to update expense status (Manager only)
 */
export function useUpdateExpenseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseId,
      ...data
    }: { expenseId: string } & UpdateExpenseStatusRequest) =>
      updateExpenseStatus(expenseId, data),
    onSuccess: () => {
      // Invalidate both my expenses and pending approvals
      queryClient.invalidateQueries({ queryKey: expenseKeys.myExpenses() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.pending() });
    },
  });
}

/**
 * Hook to update an expense (Employee only)
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseId,
      ...data
    }: { expenseId: string } & CreateExpenseRequest) =>
      updateExpenseApi(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.myExpenses() });
    },
  });
}

/**
 * Hook to withdraw an expense (Employee only)
 */
export function useWithdrawExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => withdrawExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.myExpenses() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.pending() });
    },
  });
}

