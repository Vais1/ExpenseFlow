"use client";

import { ReactNode, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Sidebar,
    SidebarBody,
    SidebarLink,
} from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/constants";
import { getStoredToken, decodeToken } from "@/hooks/use-auth";

// Icons
import {
    LayoutDashboard,
    FileText,
    Building2,
    Users,
    CheckSquare,
    LogOut,
    Shield,
} from "lucide-react";

// Menu configurations by role
const userMenu = [
    {
        label: "Dashboard",
        href: "/dashboard/customer",
        icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "My Requests",
        href: "/dashboard/customer",
        icon: <FileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
];

const managerMenu = [
    {
        label: "Overview",
        href: "/dashboard/manager",
        icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Approvals",
        href: "/dashboard/manager",
        icon: <CheckSquare className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
];

const adminMenu = [
    {
        label: "Overview",
        href: "/dashboard/admin",
        icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Invoices",
        href: "/dashboard/manager",
        icon: <FileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Vendor Management",
        href: "/dashboard/admin/vendors",
        icon: <Building2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
];

interface UserProfile {
    username: string;
    role: UserRole;
    roleLabel: string;
}

function getRoleLabel(role: UserRole): string {
    switch (role) {
        case UserRole.Admin:
            return "Admin";
        case UserRole.Management:
            return "Manager";
        case UserRole.User:
            return "User";
        default:
            return "Unknown";
    }
}

function getRoleFromString(roleStr: string): UserRole {
    if (roleStr === "Admin" || roleStr === "2") return UserRole.Admin;
    if (roleStr === "Management" || roleStr === "1") return UserRole.Management;
    return UserRole.User;
}

function getMenuForRole(role: UserRole) {
    switch (role) {
        case UserRole.Admin:
            return adminMenu;
        case UserRole.Management:
            return managerMenu;
        case UserRole.User:
        default:
            return userMenu;
    }
}

interface AppSidebarProps {
    menuItems: typeof userMenu;
    userProfile: UserProfile;
    onLogout: () => void;
}

function AppSidebar({ menuItems, userProfile, onLogout }: AppSidebarProps) {
    const pathname = usePathname();

    return (
        <Sidebar animate={true}>
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 py-2">
                        <div className="h-7 w-7 shrink-0 rounded-lg bg-primary flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-semibold text-lg text-neutral-900 dark:text-white whitespace-pre"
                        >
                            VendorPay
                        </motion.span>
                    </Link>

                    {/* Navigation */}
                    <div className="mt-8 flex flex-col gap-2">
                        {menuItems.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <SidebarLink
                                    key={link.label}
                                    link={{
                                        ...link,
                                        icon: (
                                            <div
                                                className={cn(
                                                    "shrink-0",
                                                    isActive && "text-primary"
                                                )}
                                            >
                                                {link.icon}
                                            </div>
                                        ),
                                    }}
                                    className={cn(
                                        "rounded-lg px-2 transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* User Profile & Logout */}
                <div className="flex flex-col gap-2">
                    {/* User Info */}
                    <div className="flex items-center gap-2 py-2 px-2">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-foreground uppercase">
                                {userProfile.username.charAt(0)}
                            </span>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col whitespace-pre"
                        >
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                {userProfile.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {userProfile.roleLabel}
                            </span>
                        </motion.div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 py-2 px-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm whitespace-pre"
                        >
                            Sign Out
                        </motion.span>
                    </button>
                </div>
            </SidebarBody>
        </Sidebar>
    );
}

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();

    // Get user profile from token
    const userProfile = useMemo<UserProfile | null>(() => {
        const token = getStoredToken();
        if (!token) return null;

        const decoded = decodeToken(token);
        if (!decoded) return null;

        const role = getRoleFromString(decoded.role);

        return {
            username: decoded.unique_name || "User",
            role,
            roleLabel: getRoleLabel(role),
        };
    }, []);

    // Get menu items based on role
    const menuItems = useMemo(() => {
        if (!userProfile) return userMenu;
        return getMenuForRole(userProfile.role);
    }, [userProfile]);

    // Logout handler
    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("vendorpay_access_token");
            localStorage.removeItem("vendorpay_user");
        }
        router.push("/");
    };

    // Default profile if not authenticated
    const profile = userProfile || {
        username: "Guest",
        role: UserRole.User,
        roleLabel: "Guest",
    };

    return (
        <div className="flex h-screen bg-background">
            <AppSidebar
                menuItems={menuItems}
                userProfile={profile}
                onLogout={handleLogout}
            />
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}
