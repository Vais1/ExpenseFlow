"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const requestData = {
        ...data,
        role: "employee" as const, // Default role (camelCase to match backend naming policy)
      };
      
      console.log("Sending registration request:", requestData);
      
      await registerUser(requestData);
      toast.success("Registration successful");
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error data:", error?.data);
      console.error("Error data.errors:", error?.data?.errors);
      
      let errorMessage = "Registration failed. Please try again.";
      
      // Handle detailed validation errors from backend
      // Backend returns errors as array of objects: [{ field: "email", message: "..." }, ...]
      if (error?.data?.errors && Array.isArray(error.data.errors)) {
        console.error("Validation errors array:", JSON.stringify(error.data.errors, null, 2));
        
        const validationErrors = error.data.errors
          .map((err: string | { field?: string; message?: string }) => {
            // Handle string format: "Email: The Email field is required"
            if (typeof err === "string") {
              return err;
            }
            // Handle object format: { field: "email", message: "..." }
            if (typeof err === "object" && err !== null) {
              if (err.message) return err.message;
              if (err.field && err.message) {
                const fieldName = err.field.charAt(0).toLowerCase() + err.field.slice(1);
                return `${fieldName}: ${err.message}`;
              }
            }
            return null;
          })
          .filter((msg: string | null) => msg !== null);
        
        if (validationErrors.length > 0) {
          errorMessage = validationErrors.join(". ");
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>
            Sign up to start managing your expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  aria-invalid={errors.fullName ? "true" : "false"}
                  {...register("fullName")}
                />
                <FieldError errors={errors.fullName ? [errors.fullName] : []} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? "true" : "false"}
                  {...register("email")}
                />
                <FieldError errors={errors.email ? [errors.email] : []} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={errors.password ? "true" : "false"}
                  {...register("password")}
                />
                <FieldError errors={errors.password ? [errors.password] : []} />
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

