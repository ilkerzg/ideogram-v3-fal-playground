import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { IconBox, IconBoxColor } from "./icon-box"
import { ColorBadge, BadgeColor } from "./color-badge"

interface DataItem {
  label: string
  value: string | number
  icon?: LucideIcon
  color?: IconBoxColor
}

interface DataCardProps {
  title: string
  description?: string
  items: DataItem[]
  icon?: LucideIcon
  iconColor?: IconBoxColor
  badge?: {
    label: string
    color?: BadgeColor
  }
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function DataCard({
  title,
  description,
  items,
  icon,
  iconColor = "default",
  badge,
  action,
  className
}: DataCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {icon && (
                <IconBox
                  icon={icon}
                  color={iconColor}
                  variant="subtle"
                  size="md"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-100">{title}</h3>
                  {badge && (
                    <ColorBadge
                      color={badge.color}
                      variant="subtle"
                      size="sm"
                    >
                      {badge.label}
                    </ColorBadge>
                  )}
                </div>
                {description && (
                  <p className="text-sm text-zinc-400 mt-1">{description}</p>
                )}
              </div>
            </div>
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-300"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>

      {/* Data Items */}
      <div className="divide-y divide-zinc-800">
        {items.map((item, index) => (
          <div
            key={index}
            className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/30"
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <IconBox
                  icon={item.icon}
                  color={item.color}
                  variant="ghost"
                  size="sm"
                />
              )}
              <span className="text-sm text-zinc-400">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-zinc-200">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
