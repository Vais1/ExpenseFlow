"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center p-1 rounded-full bg-muted/50 border border-border/50 h-9 w-[76px]",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/50",
        className
      )}
      {...props}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "relative flex items-center justify-center rounded-full p-1.5 transition-all duration-300 min-w-[28px] min-h-[28px]",
          resolvedTheme === "light"
            ? "bg-primary text-primary-foreground shadow-sm ring-0"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to light mode"
      >
        <Sun size={16} className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "relative flex items-center justify-center rounded-full p-1.5 transition-all duration-300 min-w-[28px] min-h-[28px]",
          resolvedTheme === "dark"
            ? "bg-primary text-primary-foreground shadow-sm ring-0"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch to dark mode"
      >
        <Moon size={16} className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ThemeSwitch;
