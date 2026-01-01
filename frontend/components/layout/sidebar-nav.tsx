'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    CheckCircle,
    History,
    Users,
    Files,
    UserPlus,
} from 'lucide-react';
import { UserRole } from '@/services/auth';

interface SidebarLink {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const ROLE_LINKS: Record<UserRole | 'Default', SidebarLink[]> = {
    User: [
        { href: '/dashboard', label: 'My Requests', icon: FileText },
        { href: '/dashboard/history', label: 'History', icon: History },
    ],
    Admin: [
        { href: '/dashboard/overview', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/approvals', label: 'Approvals', icon: CheckCircle },
        { href: '/dashboard/invoices', label: 'All Invoices', icon: Files },
        { href: '/dashboard/vendors', label: 'Vendor Management', icon: Users },
        { href: '/dashboard/history', label: 'History', icon: History },
    ],
    Default: [],
};

interface SidebarNavProps {
    role: UserRole;
    isCollapsed?: boolean;
    onNavigate?: () => void;
}

export function SidebarNav({ role, isCollapsed = false, onNavigate }: SidebarNavProps) {
    const pathname = usePathname();
    const links = ROLE_LINKS[role] || ROLE_LINKS['User'];

    return (
        <nav className="space-y-1">
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={onNavigate}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 group overflow-hidden whitespace-nowrap",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? link.label : undefined}
                    >
                        <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary")} />
                        <span className={cn(
                            "transition-all duration-300",
                            isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"
                        )}>
                            {link.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
