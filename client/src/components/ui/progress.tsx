import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'success' | 'warning' | 'error'
    showValue?: boolean
    animated?: boolean
  }
>(({ className, value, variant = 'default', showValue = false, animated = true, ...props }, ref) => {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    if (animated && value !== undefined) {
      const timer = setTimeout(() => {
        setDisplayValue(value)
      }, 100)
      return () => clearTimeout(timer)
    } else if (value !== undefined) {
      setDisplayValue(value)
    }
  }, [value, animated])

  const variantClasses = {
    default: "bg-gradient-to-r from-primary to-primary/80",
    success: "bg-gradient-to-r from-green-500 to-green-400",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-400",
    error: "bg-gradient-to-r from-red-500 to-red-400"
  }

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-muted shadow-inner",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-700 ease-out shadow-sm",
            variantClasses[variant]
          )}
          style={{ 
            transform: `translateX(-${100 - (displayValue || 0)}%)`,
          }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{displayValue}%</span>
          <span>Complete</span>
        </div>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }