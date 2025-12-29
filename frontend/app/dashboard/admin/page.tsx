"use client";

import Link from "next/link";

// Shadcn UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Icons
import { FileText, Users, Building2, Settings } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Full system administration</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Users
                        </CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Vendors
                        </CardTitle>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Invoices
                        </CardTitle>
                        <FileText className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            System Status
                        </CardTitle>
                        <Settings className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-emerald-600">Operational</div>
                    </CardContent>
                </Card>
            </div>

            {/* Admin Actions */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage system users and roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" disabled>
                            <Users className="w-4 h-4 mr-2" />
                            Manage Users (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vendor Management</CardTitle>
                        <CardDescription>Add, edit, or remove vendors</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/admin/vendors">
                            <Button className="w-full">
                                <Building2 className="w-4 h-4 mr-2" />
                                Manage Vendors
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
