import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export type BadgeColor = 
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

interface ColorBadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  variant?: "solid" | "outline" | "subtle" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: LucideIcon
  className?: string
}

const colorClasses: Record<BadgeColor, Record<"solid" | "outline" | "subtle" | "ghost", string>> = {
  blue: {
    solid: "bg-blue-600 text-white border border-blue-500",
    outline: "border border-blue-800 text-blue-300 hover:bg-blue-950/50",
    subtle: "bg-blue-950/50 text-blue-300 border border-blue-900/50",
    ghost: "text-blue-300 hover:bg-blue-950/30"
  },
  purple: {
    solid: "bg-violet-600 text-white border border-violet-500",
    outline: "border border-violet-800 text-violet-300 hover:bg-violet-950/50",
    subtle: "bg-violet-950/50 text-violet-300 border border-violet-900/50",
    ghost: "text-violet-300 hover:bg-violet-950/30"
  },
  pink: {
    solid: "bg-fuchsia-600 text-white border border-fuchsia-500",
    outline: "border border-fuchsia-800 text-fuchsia-300 hover:bg-fuchsia-950/50",
    subtle: "bg-fuchsia-950/50 text-fuchsia-300 border border-fuchsia-900/50",
    ghost: "text-fuchsia-300 hover:bg-fuchsia-950/30"
  },
  red: {
    solid: "bg-rose-600 text-white border border-rose-500",
    outline: "border border-rose-800 text-rose-300 hover:bg-rose-950/50",
    subtle: "bg-rose-950/50 text-rose-300 border border-rose-900/50",
    ghost: "text-rose-300 hover:bg-rose-950/30"
  },
  orange: {
    solid: "bg-orange-600 text-white border border-orange-500",
    outline: "border border-orange-800 text-orange-300 hover:bg-orange-950/50",
    subtle: "bg-orange-950/50 text-orange-300 border border-orange-900/50",
    ghost: "text-orange-300 hover:bg-orange-950/30"
  },
  yellow: {
    solid: "bg-amber-600 text-white border border-amber-500",
    outline: "border border-amber-800 text-amber-300 hover:bg-amber-950/50",
    subtle: "bg-amber-950/50 text-amber-300 border border-amber-900/50",
    ghost: "text-amber-300 hover:bg-amber-950/30"
  },
  green: {
    solid: "bg-emerald-600 text-white border border-emerald-500",
    outline: "border border-emerald-800 text-emerald-300 hover:bg-emerald-950/50",
    subtle: "bg-emerald-950/50 text-emerald-300 border border-emerald-900/50",
    ghost: "text-emerald-300 hover:bg-emerald-950/30"
  },
  teal: {
    solid: "bg-teal-600 text-white border border-teal-500",
    outline: "border border-teal-800 text-teal-300 hover:bg-teal-950/50",
    subtle: "bg-teal-950/50 text-teal-300 border border-teal-900/50",
    ghost: "text-teal-300 hover:bg-teal-950/30"
  },
  cyan: {
    solid: "bg-cyan-600 text-white border border-cyan-500",
    outline: "border border-cyan-800 text-cyan-300 hover:bg-cyan-950/50",
    subtle: "bg-cyan-950/50 text-cyan-300 border border-cyan-900/50",
    ghost: "text-cyan-300 hover:bg-cyan-950/30"
  },
  indigo: {
    solid: "bg-indigo-600 text-white border border-indigo-500",
    outline: "border border-indigo-800 text-indigo-300 hover:bg-indigo-950/50",
    subtle: "bg-indigo-950/50 text-indigo-300 border border-indigo-900/50",
    ghost: "text-indigo-300 hover:bg-indigo-950/30"
  },
  default: {
    solid: "bg-zinc-800 text-zinc-100 border border-zinc-700",
    outline: "border border-zinc-700 text-zinc-300 hover:bg-zinc-900/50",
    subtle: "bg-zinc-900/50 text-zinc-300 border border-zinc-800",
    ghost: "text-zinc-400 hover:bg-zinc-900/30"
  }
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base"
}

export function ColorBadge({
  children,
  color = "default",
  variant = "subtle",
  size = "md",
  icon: Icon,
  className
}: ColorBadgeProps) {
  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md backdrop-blur-sm",
        colorClasses[color][variant],
        sizeClasses[size],
        className
      )}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  )
}
