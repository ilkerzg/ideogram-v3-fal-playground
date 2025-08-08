import { cn } from "@/lib/utils"

export type StatusType = 
  | "online"
  | "offline"
  | "busy"
  | "away"
  | "active"
  | "inactive"
  | "success"
  | "warning"
  | "error"
  | "processing"

interface StatusIndicatorProps {
  status: StatusType
  label?: string
  size?: "sm" | "md" | "lg"
  pulse?: boolean
  className?: string
}

const statusConfig: Record<StatusType, {
  color: string
  pulseColor?: string
  label: string
}> = {
  online: {
    color: "bg-emerald-500",
    pulseColor: "bg-emerald-400",
    label: "Online"
  },
  offline: {
    color: "bg-zinc-500",
    label: "Offline"
  },
  busy: {
    color: "bg-rose-500",
    pulseColor: "bg-rose-400",
    label: "Busy"
  },
  away: {
    color: "bg-amber-500",
    label: "Away"
  },
  active: {
    color: "bg-blue-500",
    pulseColor: "bg-blue-400",
    label: "Active"
  },
  inactive: {
    color: "bg-zinc-600",
    label: "Inactive"
  },
  success: {
    color: "bg-emerald-500",
    label: "Success"
  },
  warning: {
    color: "bg-amber-500",
    pulseColor: "bg-amber-400",
    label: "Warning"
  },
  error: {
    color: "bg-rose-500",
    pulseColor: "bg-rose-400",
    label: "Error"
  },
  processing: {
    color: "bg-cyan-500",
    pulseColor: "bg-cyan-400",
    label: "Processing"
  }
}

const sizeClasses = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4"
}

export function StatusIndicator({
  status,
  label,
  size = "md",
  pulse = false,
  className
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const displayLabel = label || config.label
  
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="relative inline-flex">
        {pulse && config.pulseColor && (
          <span 
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75",
              config.pulseColor,
              "animate-ping"
            )}
          />
        )}
        <span 
          className={cn(
            "relative inline-flex rounded-full",
            sizeClasses[size],
            config.color
          )}
        />
      </div>
      {displayLabel && (
        <span className="text-sm text-zinc-400">
          {displayLabel}
        </span>
      )}
    </div>
  )
}
