'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthSession } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    Wallet
} from 'lucide-react';
import { SidebarNav } from './sidebar-nav';

export function Sidebar() {
    const router = useRouter();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const currentSession = authService.getSession();
        if (!currentSession) {
            router.push('/auth/login');
        } else {
            setSession(currentSession);
        }
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        authService.logout();
        router.replace('/auth/login');
    };

    if (loading) {
        return <div className="hidden md:block w-64 border-r bg-card h-full animate-pulse" />;
    }

    if (!session) return null;

    const role = session.user.role || 'User';

    return (
        <div
            className={cn(
                "hidden md:flex flex-col h-full border-r bg-card transition-all duration-300 ease-in-out relative group",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Collapse Toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm hover:bg-accent hidden group-hover:flex z-10"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>

            {/* Header */}
            <div className={cn("p-4 flex items-center h-16", isCollapsed ? "justify-center" : "gap-3")}>
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Wallet className="h-4 w-4 text-primary-foreground" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-sm font-bold tracking-tight text-foreground truncate">VendorPay</h1>
                        <span className="text-[10px] text-muted-foreground truncate">Expense Management</span>
                    </div>
                )}
            </div>

            {/* Nav */}
            <div className="flex-1 px-3 py-2 overflow-x-hidden">
                <SidebarNav role={role} isCollapsed={isCollapsed} />
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-muted/20">
                <div className={cn("flex items-center gap-2", isCollapsed && "justify-center flex-col gap-3")}>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                            <span className="text-sm font-medium leading-none truncate">{session.user.username}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">{role}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                            title="Log Out"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="sr-only">Log Out</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

