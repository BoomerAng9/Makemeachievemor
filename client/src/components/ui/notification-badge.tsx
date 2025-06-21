import * as React from "react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  count?: number
  show?: boolean
  max?: number
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  pulse?: boolean
}

export function NotificationBadge({ 
  count = 0, 
  show = true, 
  max = 99, 
  className,
  children,
  variant = 'destructive',
  pulse = true
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString()
  const shouldShow = show && count > 0

  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      {shouldShow && (
        <Badge
          variant={variant}
          className={cn(
            "absolute -top-2 -right-2 h-5 min-w-[20px] flex items-center justify-center text-xs font-bold px-1.5 py-0 rounded-full border-2 border-background",
            pulse && "animate-pulse",
            variant === 'destructive' && "bg-red-500 text-white shadow-lg shadow-red-500/25"
          )}
        >
          {displayCount}
        </Badge>
      )}
    </div>
  )
}