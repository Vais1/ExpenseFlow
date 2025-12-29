"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin, useAdminRegister } from "@/hooks/use-admin-auth";
import { UserRole } from "@/lib/constants";

// Shadcn UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Icons
import { AlertCircle, CheckCircle2, Loader2, Shield, User, Lock } from "lucide-react";

// Validation schemas - strict validation
const loginSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be less than 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
});

const registerSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username must be less than 50 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password must be less than 100 characters"),
        confirmPassword: z.string().min(6, "Please confirm your password"),
        role: z.nativeEnum(UserRole).refine(
            (val) => val === UserRole.Management || val === UserRole.Admin,
            { message: "Please select a valid staff role" }
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AdminAuthPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loginMutation = useAdminLogin();
    const registerMutation = useAdminRegister();

    // Login form
    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    // Register form
    const registerForm = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
            role: UserRole.Management,
        },
    });

    // Handle login submission
    const onLogin = (data: LoginFormData) => {
        setSuccessMessage(null);
        loginMutation.mutate(data);
    };

    // Handle register submission
    const onRegister = (data: RegisterFormData) => {
        setSuccessMessage(null);
        registerMutation.mutate(
            {
                username: data.username,
                password: data.password,
                role: data.role,
            },
            {
                onSuccess: () => {
                    const roleLabel = data.role === UserRole.Admin ? "Admin" : "Manager";
                    setSuccessMessage(`${roleLabel} account created successfully! Please log in.`);
                    registerForm.reset();
                    setActiveTab("login");
                },
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            {/* Corporate gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <Card className="w-full max-w-md relative z-10 bg-white dark:bg-slate-800 shadow-2xl border-0">
                <CardHeader className="text-center space-y-3 pb-4">
                    <div className="mx-auto w-14 h-14 bg-slate-900 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                        VendorPay
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">
                        Administrative Portal
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Success Alert */}
                    {successMessage && (
                        <Alert className="mb-4 border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <AlertTitle className="text-emerald-800 dark:text-emerald-200">Success</AlertTitle>
                            <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Alerts */}
                    {loginMutation.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Access Denied</AlertTitle>
                            <AlertDescription>
                                {loginMutation.error instanceof Error
                                    ? loginMutation.error.message
                                    : "Authentication failed"}
                            </AlertDescription>
                        </Alert>
                    )}

                    {registerMutation.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Registration Failed</AlertTitle>
                            <AlertDescription>
                                {registerMutation.error instanceof Error
                                    ? registerMutation.error.message
                                    : "An unexpected error occurred"}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login">Sign In</TabsTrigger>
                            <TabsTrigger value="register">Create Staff Account</TabsTrigger>
                        </TabsList>

                        {/* Login Tab */}
                        <TabsContent value="login" className="space-y-4">
                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-username" className="text-slate-700 dark:text-slate-200">
                                        Username
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="login-username"
                                            type="text"
                                            placeholder="Enter your username"
                                            className="pl-10"
                                            {...loginForm.register("username")}
                                        />
                                    </div>
                                    {loginForm.formState.errors.username && (
                                        <p className="text-sm text-destructive">
                                            {loginForm.formState.errors.username.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="text-slate-700 dark:text-slate-200">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="login-password"
                                            type="password"
                                            placeholder="Enter your password"
                                            className="pl-10"
                                            {...loginForm.register("password")}
                                        />
                                    </div>
                                    {loginForm.formState.errors.password && (
                                        <p className="text-sm text-destructive">
                                            {loginForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>

                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                                    This portal is for Management and Admin staff only.
                                    <br />
                                    Customers should use the{" "}
                                    <a href="/auth/customer" className="text-primary hover:underline">
                                        Customer Portal
                                    </a>
                                    .
                                </p>
                            </div>
                        </TabsContent>

                        {/* Register Tab */}
                        <TabsContent value="register" className="space-y-4">
                            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-username" className="text-slate-700 dark:text-slate-200">
                                        Username
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="register-username"
                                            type="text"
                                            placeholder="Choose a username"
                                            className="pl-10"
                                            {...registerForm.register("username")}
                                        />
                                    </div>
                                    {registerForm.formState.errors.username && (
                                        <p className="text-sm text-destructive">
                                            {registerForm.formState.errors.username.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-role" className="text-slate-700 dark:text-slate-200">
                                        Role
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            registerForm.setValue("role", parseInt(value, 10) as UserRole)
                                        }
                                        defaultValue={UserRole.Management.toString()}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={UserRole.Management.toString()}>
                                                Management
                                            </SelectItem>
                                            <SelectItem value={UserRole.Admin.toString()}>
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {registerForm.formState.errors.role && (
                                        <p className="text-sm text-destructive">
                                            {registerForm.formState.errors.role.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password" className="text-slate-700 dark:text-slate-200">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="register-password"
                                            type="password"
                                            placeholder="Create a password"
                                            className="pl-10"
                                            {...registerForm.register("password")}
                                        />
                                    </div>
                                    {registerForm.formState.errors.password && (
                                        <p className="text-sm text-destructive">
                                            {registerForm.formState.errors.password.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-confirm" className="text-slate-700 dark:text-slate-200">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="register-confirm"
                                            type="password"
                                            placeholder="Confirm your password"
                                            className="pl-10"
                                            {...registerForm.register("confirmPassword")}
                                        />
                                    </div>
                                    {registerForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-destructive">
                                            {registerForm.formState.errors.confirmPassword.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Staff Account"
                                    )}
                                </Button>
                            </form>

                            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
                                Staff accounts require appropriate role selection.
                            </p>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-xs text-slate-500">
                    VendorPay Administrative Portal • Secure Access Only
                </p>
            </div>
        </div>
    );
}
