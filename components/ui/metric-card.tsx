import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { IconBox, IconBoxColor } from "./icon-box"
import { ColorBadge, BadgeColor } from "./color-badge"
import { ProgressBar, ProgressColor } from "./progress-bar"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  iconColor?: IconBoxColor
  badge?: {
    label: string
    color?: BadgeColor
    variant?: "solid" | "outline" | "subtle" | "ghost"
  }
  progress?: {
    value: number
    max?: number
    color?: ProgressColor
  }
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = "default",
  badge,
  progress,
  trend,
  className
}: MetricCardProps) {
  return (
    <div className={cn(
      "relative rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6",
      "hover:border-zinc-700",
      className
    )}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
                {title}
              </h3>
              {badge && (
                <ColorBadge
                  color={badge.color}
                  variant={badge.variant || "subtle"}
                  size="sm"
                >
                  {badge.label}
                </ColorBadge>
              )}
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl font-bold tracking-tight text-zinc-100">
                {value}
              </p>
              {trend && (
                <span className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium",
                  trend.isPositive 
                    ? "bg-emerald-950/50 text-emerald-300 border border-emerald-900/50" 
                    : "bg-rose-950/50 text-rose-300 border border-rose-900/50"
                )}>
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-zinc-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <IconBox
              icon={icon}
              color={iconColor}
              variant="subtle"
              size="md"
            />
          )}
        </div>

        {/* Progress */}
        {progress && (
          <ProgressBar
            value={progress.value}
            max={progress.max}
            color={progress.color}
            size="sm"
          />
        )}
      </div>
    </div>
  )
}
