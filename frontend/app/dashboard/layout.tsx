'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { authService } from '@/services/auth';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = authService.getSession();
        if (!session) {
            // Redirect immediately if not authenticated
            router.push('/auth/login');
        } else {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        // Minimal loading UI to prevent layout shift before redirect logic hits
        return (
            <div className="min-h-screen w-full flex bg-background">
                <div className="w-64 border-r bg-card h-full animate-pulse flex-none" />
                <div className="flex-1 p-8 space-y-4">
                    <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-64 w-full bg-muted rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Logic in effect will handle redirect

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-slate-50/30">
                <div className="h-full w-full p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
