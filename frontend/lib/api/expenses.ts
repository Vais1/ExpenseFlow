import { post, get, patch, put } from "./client";
import type { ExpenseClaim, ExpenseStatus } from "@/types/schema";

/**
 * Create expense request payload
 */
export interface CreateExpenseRequest {
  amount: number;
  category: string;
  description: string;
  dateIncurred: string; // ISO date string
}

/**
 * Update expense status request payload
 */
export interface UpdateExpenseStatusRequest {
  status: ExpenseStatus;
  reason?: string;
}

/**
 * Expense response from API (matches backend ExpenseDto)
 */
export interface ExpenseResponse {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  dateIncurred: string;
  status: ExpenseStatus;
  rejectionReason?: string;
  createdAt: string;
}

/**
 * Submit a new expense
 */
export async function createExpense(
  request: CreateExpenseRequest
): Promise<ExpenseResponse> {
  return post<ExpenseResponse>("/api/expenses", request);
}

/**
 * Get current user's expenses
 */
export async function getMyExpenses(): Promise<ExpenseResponse[]> {
  return get<ExpenseResponse[]>("/api/expenses/my-history");
}

/**
 * Get pending approvals (Manager only)
 */
export async function getPendingApprovals(): Promise<ExpenseResponse[]> {
  return get<ExpenseResponse[]>("/api/expenses/pending");
}

/**
 * Update expense status (Manager only)
 */
export async function updateExpenseStatus(
  expenseId: string,
  request: UpdateExpenseStatusRequest
): Promise<ExpenseResponse> {
  return patch<ExpenseResponse>(`/api/expenses/${expenseId}/status`, request);
}

/**
 * Update an expense (Employee only, pending expenses)
 */
export async function updateExpense(
  expenseId: string,
  request: CreateExpenseRequest
): Promise<ExpenseResponse> {
  return put<ExpenseResponse>(`/api/expenses/${expenseId}`, request);
}

/**
 * Withdraw an expense (Employee only, pending expenses)
 */
export async function withdrawExpense(
  expenseId: string
): Promise<ExpenseResponse> {
  return patch<ExpenseResponse>(`/api/expenses/${expenseId}/withdraw`, {});
}

