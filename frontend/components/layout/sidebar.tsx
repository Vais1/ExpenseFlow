'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authService, AuthSession, UserRole } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    CheckCircle,
    History,
    Users,
    Files,
    LogOut,
} from 'lucide-react';

interface SidebarLink {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const ROLE_LINKS: Record<UserRole | 'Default', SidebarLink[]> = {
    User: [
        { href: '/dashboard', label: 'My Requests', icon: FileText },
        { href: '/dashboard/requests/new', label: 'New Request', icon: PlusCircle },
    ],
    Management: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/approvals', label: 'Approvals', icon: CheckCircle },
        { href: '/dashboard/history', label: 'History', icon: History },
    ],
    Admin: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/vendors', label: 'Vendor Management', icon: Users },
        { href: '/dashboard/invoices', label: 'All Invoices', icon: Files },
    ],
    Default: [],
};

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);

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
        // A simple loading placeholder for the sidebar itself, or just empty
        return <div className="w-64 border-r bg-card h-full animate-pulse" />;
    }

    if (!session) return null; // Should redirect in effect

    const role = session.user.role || 'User';
    const links = ROLE_LINKS[role] || ROLE_LINKS['User'];

    return (
        <div className="w-60 flex-none border-r bg-card h-full flex flex-col justify-between">
            <div className="py-3 px-3">
                <div className="mb-6 px-2 flex items-center gap-2">
                    <div className="h-6 w-6 bg-primary rounded-sm" />
                    <h1 className="text-base font-semibold tracking-tight text-primary">VendorPay</h1>
                </div>
                <nav className="space-y-0.5">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors my-0.5",
                                    isActive
                                        ? "bg-secondary text-secondary-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-3 border-t bg-slate-50/50">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col px-2">
                        <span className="text-sm font-medium leading-none truncate">{session.user.username}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{role}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="text-xs">Log Out</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
