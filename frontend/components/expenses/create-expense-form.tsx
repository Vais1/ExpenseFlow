"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/**
 * Expense categories available for selection
 */
const EXPENSE_CATEGORIES = [
  "Travel",
  "Medical",
  "Equipment",
  "Meals",
  "Office Supplies",
  "Other",
] as const;

/**
 * Zod schema for expense form validation
 */
const expenseFormSchema = z.object({
  amount: z
    .number({
      message: "Amount must be a number",
    })
    .positive("Amount must be greater than 0")
    .min(0.01, "Amount must be at least 0.01"),
  category: z.enum(EXPENSE_CATEGORIES, {
    message: "Category is required",
  }),
  description: z
    .string({
      message: "Description is required",
    })
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must not exceed 500 characters"),
  date: z
    .string({
      message: "Date is required",
    })
    .refine(
      (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return selectedDate <= today;
      },
      {
        message: "Date cannot be in the future",
      }
    ),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface CreateExpenseFormProps {
  /** Optional callback when form is submitted successfully */
  onSubmit?: (data: {
    amount: number;
    category: string;
    description: string;
    dateIncurred: string;
  }) => Promise<void> | void;
  /** Initial form data for editing */
  initialData?: {
    amount: number;
    category: (typeof EXPENSE_CATEGORIES)[number];
    description: string;
    date: string;
  };
}

/**
 * Create Expense Form component
 * Allows users to submit new expense claims with validation
 */
export const CreateExpenseForm: React.FC<CreateExpenseFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: initialData || {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const categoryValue = watch("category");

  const onFormSubmit = async (data: ExpenseFormData) => {
    // Convert date to ISO string format expected by backend
    const submitData = {
      amount: data.amount,
      category: data.category,
      description: data.description,
      dateIncurred: new Date(data.date).toISOString(),
    };
    
    if (onSubmit) {
      await onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <FieldGroup>
        {/* Amount Field */}
        <Field>
          <FieldLabel htmlFor="amount">Amount</FieldLabel>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            aria-invalid={errors.amount ? "true" : "false"}
            {...register("amount", { valueAsNumber: true })}
          />
          <FieldError errors={errors.amount ? [errors.amount] : []} />
        </Field>

        {/* Category Field */}
        <Field>
          <FieldLabel htmlFor="category">Category</FieldLabel>
          <Select
            value={categoryValue}
            onValueChange={(value) => {
              setValue("category", value as (typeof EXPENSE_CATEGORIES)[number], {
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger id="category" aria-invalid={errors.category ? "true" : "false"}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={errors.category ? [errors.category] : []} />
        </Field>

        {/* Date Field */}
        <Field>
          <FieldLabel htmlFor="date">Date</FieldLabel>
          <div className="relative">
            <HugeiconsIcon icon={Calendar01Icon} className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              id="date"
              type="date"
              className="pl-8"
              aria-invalid={errors.date ? "true" : "false"}
              {...register("date")}
            />
          </div>
          <FieldError errors={errors.date ? [errors.date] : []} />
        </Field>

        {/* Description Field */}
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            placeholder="Enter expense description..."
            rows={4}
            aria-invalid={errors.description ? "true" : "false"}
            {...register("description")}
          />
          <FieldError errors={errors.description ? [errors.description] : []} />
        </Field>
      </FieldGroup>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Expense"}
        </Button>
      </div>
    </form>
  );
};

