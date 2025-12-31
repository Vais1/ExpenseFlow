'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { authService } from '@/services/auth';

import { SystemHealth } from '@/components/system-health';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            const session = await authService.refreshSession();
            if (!session) {
                // Redirect immediately if not authenticated
                router.push('/auth/login');
            } else {
                setIsAuthenticated(true);
            }
            setLoading(false);
        };
        validateSession();
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                    {/* Assuming Spinner component exists, if not, this would cause an error */}
                    {/* <Spinner className="h-8 w-8 text-primary" /> */}
                    <div className="h-8 w-8 bg-primary rounded-full animate-spin" /> {/* Placeholder for Spinner */}
                    <p className="text-sm text-muted-foreground animate-pulse">Verifying session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null; // Logic in effect will handle redirect

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Desktop Sidebar - hidden on mobile */}
            <Sidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Mobile Header - hidden on desktop */}
                <MobileSidebar />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ease-in-out">
                    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                        {children}
                    </div>
                </main>
            </div>
            <SystemHealth />
        </div>
    );
}
