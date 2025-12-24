/**
 * ExpenseFlow TypeScript Schema
 * 
 * Core type definitions for the Expense Approval System
 */

/**
 * User roles in the ExpenseFlow system
 */
export type UserRole = "Employee" | "Manager" | "Admin";

/**
 * Expense claim status values
 */
export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

/**
 * User interface representing a system user
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's full name */
  name: string;
  /** User's email address */
  email: string;
  /** User's role in the system */
  role: UserRole;
}

/**
 * Expense claim interface representing an expense submission
 */
export interface ExpenseClaim {
  /** Unique identifier for the expense claim */
  id: string;
  /** Expense amount in the base currency */
  amount: number;
  /** Category of the expense (e.g., "Travel", "Medical", "Equipment") */
  category: string;
  /** Detailed description of the expense */
  description: string;
  /** Date when the expense was incurred */
  date: Date | string;
  /** Current status of the expense claim */
  status: ExpenseStatus;
  /** URL to the attached receipt or supporting document */
  attachmentUrl?: string;
}

