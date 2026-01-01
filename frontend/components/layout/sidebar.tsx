'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthSession } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    Moon,
    Sun,
    Monitor
} from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
    const router = useRouter();
    const [session, setSession] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { setTheme } = useTheme();

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
            <div className={cn("p-4 flex items-center h-14", isCollapsed ? "justify-center" : "gap-3")}>
                <div className="h-8 w-8 relative flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.svg" alt="VendorPay Logo" className="h-full w-full object-contain" />
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full flex items-center gap-2 h-10 px-2 justify-start hover:bg-accent hover:text-accent-foreground",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            <Settings className="h-5 w-5 shrink-0 text-muted-foreground" />
                            {!isCollapsed && (
                                <span className="text-sm font-medium text-muted-foreground">Settings</span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56"
                        align="start"
                        side={isCollapsed ? "right" : "top"}
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session.user.username}</p>
                                <p className="text-xs leading-none text-muted-foreground capitalize">{role}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span>Theme</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    <Sun className="mr-2 h-4 w-4" />
                                    <span>Light</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    <Moon className="mr-2 h-4 w-4" />
                                    <span>Dark</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    <Monitor className="mr-2 h-4 w-4" />
                                    <span>System</span>
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

