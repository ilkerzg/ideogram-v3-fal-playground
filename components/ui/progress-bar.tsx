import { cn } from "@/lib/utils"

export type ProgressColor = 
  | "blue" 
  | "purple" 
  | "pink" 
  | "red" 
  | "orange" 
  | "yellow" 
  | "green" 
  | "teal" 
  | "cyan" 
  | "indigo"
  | "default"

interface ProgressBarProps {
  value: number
  max?: number
  color?: ProgressColor
  size?: "sm" | "md" | "lg"
  label?: string
  showValue?: boolean
  className?: string
}

const colorClasses: Record<ProgressColor, string> = {
  blue: "bg-blue-500",
  purple: "bg-violet-500",
  pink: "bg-fuchsia-500",
  red: "bg-rose-500",
  orange: "bg-orange-500",
  yellow: "bg-amber-500",
  green: "bg-emerald-500",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
  indigo: "bg-indigo-500",
  default: "bg-zinc-500"
}

const sizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3"
}

export function ProgressBar({
  value,
  max = 100,
  color = "default",
  size = "md",
  label,
  showValue = false,
  className
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-medium text-zinc-300">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full",
            colorClasses[color],
            "opacity-90"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
