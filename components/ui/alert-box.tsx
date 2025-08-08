import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { IconBox } from "./icon-box"

export type AlertVariant = "default" | "success" | "warning" | "error" | "info"

interface AlertBoxProps {
  title?: string
  description: string
  variant?: AlertVariant
  icon?: LucideIcon
  className?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const variantConfig: Record<AlertVariant, {
  bg: string
  border: string
  text: string
  icon: string
  iconColor: "default" | "green" | "yellow" | "red" | "blue"
}> = {
  default: {
    bg: "bg-zinc-900/50",
    border: "border-zinc-800",
    text: "text-zinc-300",
    icon: "text-zinc-400",
    iconColor: "default"
  },
  success: {
    bg: "bg-emerald-950/30",
    border: "border-emerald-900/50",
    text: "text-emerald-300",
    icon: "text-emerald-400",
    iconColor: "green"
  },
  warning: {
    bg: "bg-amber-950/30",
    border: "border-amber-900/50",
    text: "text-amber-300",
    icon: "text-amber-400",
    iconColor: "yellow"
  },
  error: {
    bg: "bg-rose-950/30",
    border: "border-rose-900/50",
    text: "text-rose-300",
    icon: "text-rose-400",
    iconColor: "red"
  },
  info: {
    bg: "bg-sky-950/30",
    border: "border-sky-900/50",
    text: "text-sky-300",
    icon: "text-sky-400",
    iconColor: "blue"
  }
}

export function AlertBox({
  title,
  description,
  variant = "default",
  icon,
  className,
  action
}: AlertBoxProps) {
  const config = variantConfig[variant]
  
  return (
    <div
      className={cn(
        "relative rounded-lg border backdrop-blur-sm p-4",
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex gap-3">
        {icon && (
          <IconBox
            icon={icon}
            color={config.iconColor}
            variant="subtle"
            size="sm"
            className="shrink-0"
          />
        )}
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className={cn("text-sm font-semibold", config.text)}>
              {title}
            </h4>
          )}
          <p className={cn("text-sm", config.text, "opacity-90")}>
            {description}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "mt-2 text-xs font-medium",
                config.text,
                "hover:opacity-80"
              )}
            >
              {action.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
