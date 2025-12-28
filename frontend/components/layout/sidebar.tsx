"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/schema";
import {
  LayoutIcon,
  FolderCheckIcon,
  FileText,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  /** User role to determine which navigation links to show */
  userRole: UserRole;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: typeof LayoutIcon;
}

/**
 * Sidebar component for the ExpenseFlow dashboard layout
 * Displays role-based navigation links
 */
export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const { logout } = useAuth();
  // Define navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutIcon,
      },
    ];

    switch (userRole) {
      case "employee":
        return [
          ...baseItems,
          {
            label: "My Claims",
            href: "/expenses",
            icon: FileText,
          },
        ];
      case "manager":
        return [
          ...baseItems,
          {
            label: "Approvals",
            href: "/approvals",
            icon: FolderCheckIcon,
          },
        ];
      case "admin":
        return [
          ...baseItems,
          {
            label: "My Claims",
            href: "/expenses",
            icon: FileText,
          },
          {
            label: "Approvals",
            href: "/approvals",
            icon: FolderCheckIcon,
          },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-background">
      <div className="flex h-16 items-center border-b border-border px-6">
        <h2 className="text-lg font-semibold text-foreground">ExpenseFlow</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-left font-normal",
                "hover:bg-muted hover:text-foreground"
              )}
              asChild
            >
              <Link href={item.href}>
                <HugeiconsIcon icon={item.icon} className="size-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-left font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={logout}
        >
          <HugeiconsIcon icon={Logout01Icon} className="size-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
};

