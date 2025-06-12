import { ReactNode } from "react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Layout({ 
  children, 
  showNav = true, 
  className,
  maxWidth = "7xl",
  padding = "md"
}: LayoutProps) {
  const isMobile = useIsMobile();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
    full: "max-w-full"
  };

  const paddingClasses = {
    none: "",
    sm: "px-2 sm:px-4",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12"
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className={cn(
        "mx-auto",
        maxWidthClasses[maxWidth] || "max-w-7xl",
        paddingClasses[padding],
        "py-8",
        isMobile ? "pb-safe-area-inset-bottom" : "pb-8",
        className
      )}>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ 
  title, 
  subtitle, 
  action,
  className 
}: { 
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "flex flex-col gap-4 mb-6 sm:mb-8",
      isMobile ? "items-start" : "sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}

export function ResponsiveGrid({ 
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "md",
  className
}: {
  children: ReactNode;
  cols?: { mobile?: number; tablet?: number; desktop?: number };
  gap?: "sm" | "md" | "lg";
  className?: string;
}) {
  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8"
  };

  const gridClasses = cn(
    "grid",
    gapClasses[gap],
    `grid-cols-${cols.mobile || 1}`,
    `md:grid-cols-${cols.tablet || 2}`,
    `lg:grid-cols-${cols.desktop || 3}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}