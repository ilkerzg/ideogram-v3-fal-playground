import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { IconBox, IconBoxColor } from "./icon-box"

interface StatProps {
  label: string
  value: string | number
  description?: string
  icon?: LucideIcon
  color?: IconBoxColor
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function Stat({
  label,
  value,
  description,
  icon,
  color = "default",
  trend,
  className
}: StatProps) {
  return (
    <div className={cn(
      "relative rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold tracking-tight text-zinc-100">{value}</p>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                  trend.isPositive 
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-900/50" 
                    : "bg-rose-950/50 text-rose-300 border border-rose-900/50"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-zinc-400 mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <IconBox
            icon={icon}
            color={color}
            variant="subtle"
            size="lg"
          />
        )}
      </div>
    </div>
  )
}
