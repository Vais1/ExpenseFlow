"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { UserRole } from "@/lib/constants";

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons (using lucide-react for consistent availability)
import { AlertCircle, CheckCircle2, Loader2, Lock, User } from "lucide-react";

// Validation schemas
const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z
    .object({
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function CustomerAuthPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const loginMutation = useLogin();
    const registerMutation = useRegister();

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
                confirmPassword: data.confirmPassword,
                role: UserRole.User,
            },
            {
                onSuccess: () => {
                    setSuccessMessage("Account created successfully! Please log in.");
                    registerForm.reset();
                    setActiveTab("login");
                },
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            {/* Subtle pattern background */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />

            <Card className="w-full max-w-md relative z-10 border-border shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        VendorPay
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Customer Portal - Manage your invoices
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Success Alert */}
                    {successMessage && (
                        <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Alerts */}
                    {loginMutation.error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Login Failed</AlertTitle>
                            <AlertDescription>
                                {loginMutation.error instanceof Error
                                    ? loginMutation.error.message
                                    : "An unexpected error occurred"}
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
                            <TabsTrigger value="register">Create Account</TabsTrigger>
                        </TabsList>

                        {/* Login Tab */}
                        <TabsContent value="login" className="space-y-4">
                            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-username" className="text-slate-700 dark:text-slate-300">
                                        Username
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    <Label htmlFor="login-password" className="text-slate-700 dark:text-slate-300">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    className="w-full"
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        {/* Register Tab */}
                        <TabsContent value="register" className="space-y-4">
                            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-username" className="text-slate-700 dark:text-slate-300">
                                        Username
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    <Label htmlFor="register-password" className="text-slate-700 dark:text-slate-300">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    <Label htmlFor="register-confirm" className="text-slate-700 dark:text-slate-300">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                    className="w-full"
                                    disabled={registerMutation.isPending}
                                >
                                    {registerMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        By continuing, you agree to VendorPay&apos;s Terms of Service and Privacy Policy.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
