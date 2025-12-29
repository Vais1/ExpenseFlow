"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredToken, decodeToken } from "@/hooks/use-auth";
import { UserRole, ROUTES } from "@/lib/constants";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Icons
import { ShieldCheck, User, Lock, ArrowRight, Building2 } from "lucide-react";

function getRoleFromString(roleStr: string): UserRole {
    if (roleStr === "Admin" || roleStr === "2") return UserRole.Admin;
    if (roleStr === "Management" || roleStr === "1") return UserRole.Management;
    return UserRole.User;
}

function getRedirectPath(role: UserRole): string {
    switch (role) {
        case UserRole.Admin:
            return ROUTES.adminDashboard;
        case UserRole.Management:
            return ROUTES.managerDashboard;
        case UserRole.User:
        default:
            return ROUTES.customerDashboard;
    }
}

export default function LandingPage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    // Check for existing auth and redirect
    useEffect(() => {
        const token = getStoredToken();

        if (token) {
            const decoded = decodeToken(token);
            if (decoded && decoded.exp * 1000 > Date.now()) {
                const role = getRoleFromString(decoded.role);
                router.push(getRedirectPath(role));
                return;
            }
        }

        setIsChecking(false);
    }, [router]);

    // Show loading while checking auth
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative min-h-screen flex flex-col">
                {/* Header */}
                <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-900">VendorPay</span>
                        </div>
                        <div className="text-xs text-slate-400">
                            Enterprise Portal v1.0
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="max-w-3xl w-full text-center">
                        {/* Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-24 h-24 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                                <ShieldCheck className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
                            VendorPay Portal
                        </h1>
                        <p className="text-lg text-slate-600 mb-12 max-w-xl mx-auto">
                            Secure E-Submission & Approval System
                        </p>

                        {/* Auth Cards */}
                        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                            {/* Employee Login */}
                            <Link href={ROUTES.customerAuth}>
                                <Card className="h-full bg-white border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
                                    <CardHeader className="pb-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                                            <User className="w-6 h-6 text-slate-700" />
                                        </div>
                                        <CardTitle className="text-xl text-slate-900">
                                            Employee Login
                                        </CardTitle>
                                        <CardDescription className="text-slate-500">
                                            Submit and track your invoice requests
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            className="w-full group-hover:bg-slate-50 transition-colors"
                                        >
                                            Sign In
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>

                            {/* Staff / Admin Portal */}
                            <Link href={ROUTES.adminAuth}>
                                <Card className="h-full bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer group">
                                    <CardHeader className="pb-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                                            <Lock className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <CardTitle className="text-xl text-white">
                                            Staff / Admin Portal
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Management and administrative access
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="secondary"
                                            className="w-full bg-slate-800 text-white hover:bg-slate-700 border-slate-700 group-hover:bg-slate-700 transition-colors"
                                        >
                                            Secure Access
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>

                        {/* Security Note */}
                        <p className="mt-12 text-xs text-slate-400 max-w-md mx-auto">
                            This is a secure corporate system. Unauthorized access is prohibited.
                            All activities are logged and monitored.
                        </p>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs text-slate-400">
                            © 2024 VendorPay. Internal Use Only.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Enterprise Edition</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>Secure Connection</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
