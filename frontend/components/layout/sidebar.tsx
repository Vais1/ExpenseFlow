"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/schema";
import {
  Dashboard01Icon,
  FileCheckIcon,
  FileTextIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface SidebarProps {
  /** User role to determine which navigation links to show */
  userRole: UserRole;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Sidebar component for the ExpenseFlow dashboard layout
 * Displays role-based navigation links
 */
export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  // Define navigation items based on user role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Dashboard01Icon,
      },
    ];

    switch (userRole) {
      case "Employee":
        return [
          ...baseItems,
          {
            label: "My Claims",
            href: "/dashboard/my-claims",
            icon: FileTextIcon,
          },
        ];
      case "Manager":
        return [
          ...baseItems,
          {
            label: "Approvals",
            href: "/dashboard/approvals",
            icon: FileCheckIcon,
          },
        ];
      case "Admin":
        return [
          ...baseItems,
          {
            label: "My Claims",
            href: "/dashboard/my-claims",
            icon: FileTextIcon,
          },
          {
            label: "Approvals",
            href: "/dashboard/approvals",
            icon: FileCheckIcon,
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
          const Icon = item.icon;
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
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};

