import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  fullWidth?: boolean;
  noPadding?: boolean;
}

export function MobileCard({ 
  title, 
  description, 
  children, 
  className,
  headerAction,
  fullWidth = false,
  noPadding = false
}: MobileCardProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
        fullWidth ? "mx-0" : "mx-0", // Full width on mobile
        className
      )}>
        {(title || description || headerAction) && (
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
              {headerAction && (
                <div className="ml-4 flex-shrink-0">
                  {headerAction}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={cn(
          noPadding ? "p-0" : "p-4",
          "touch-manipulation"
        )}>
          {children}
        </div>
      </div>
    );
  }

  // Desktop/tablet version
  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", className)}>
      {(title || description || headerAction) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              {title && <CardTitle className="truncate">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {headerAction && (
              <div className="ml-4 flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(noPadding && "p-0")}>
        {children}
      </CardContent>
    </Card>
  );
}

export function MobileGrid({ 
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
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className={cn("space-y-0", className)}>
        {children}
      </div>
    );
  }

  const gapClasses = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8"
  };

  return (
    <div className={cn(
      "grid",
      gapClasses[gap],
      `grid-cols-${cols.mobile || 1}`,
      `md:grid-cols-${cols.tablet || 2}`,
      `lg:grid-cols-${cols.desktop || 3}`,
      className
    )}>
      {children}
    </div>
  );
}

export function TouchButton({ 
  children, 
  onClick, 
  variant = "default",
  size = "default",
  className,
  disabled = false
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
  className?: string;
  disabled?: boolean;
}) {
  const isMobile = useIsMobile();
  
  const baseClasses = "touch-manipulation transition-all duration-200 font-medium rounded-lg flex items-center justify-center";
  
  const sizeClasses = {
    sm: isMobile ? "min-h-[48px] px-4 text-sm" : "min-h-[36px] px-3 text-sm",
    default: isMobile ? "min-h-[48px] px-6 text-base" : "min-h-[40px] px-4 text-base",
    lg: isMobile ? "min-h-[56px] px-8 text-lg" : "min-h-[48px] px-6 text-lg"
  };
  
  const variantClasses = {
    default: "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {children}
    </button>
  );
}