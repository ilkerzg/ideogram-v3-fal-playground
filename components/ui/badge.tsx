import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-medium backdrop-blur-sm rounded-md",
  {
    variants: {
      variant: {
        // Core colored variants - aesthetic colors with better readability
        default:
          "bg-zinc-900/90 text-zinc-100 border border-zinc-800",
        primary:
          "bg-blue-950/50 text-blue-300 border border-blue-900/50",
        secondary:
          "bg-violet-950/50 text-violet-300 border border-violet-900/50",
        
        // Semantic variants with improved aesthetics
        success:
          "bg-emerald-950/50 text-emerald-300 border border-emerald-900/50",
        warning:
          "bg-amber-950/50 text-amber-300 border border-amber-900/50",
        error:
          "bg-rose-950/50 text-rose-300 border border-rose-900/50",
        info:
          "bg-sky-950/50 text-sky-300 border border-sky-900/50",
        
        // Special variants with aesthetic colors
        premium:
          "bg-yellow-950/50 text-yellow-300 border border-yellow-900/50",
        trending:
          "bg-fuchsia-950/50 text-fuchsia-300 border border-fuchsia-900/50",
        new:
          "bg-indigo-950/50 text-indigo-300 border border-indigo-900/50",
        
        // Architecture variants with refined colors
        transformer:
          "bg-purple-950/50 text-purple-300 border border-purple-900/50",
        diffusion:
          "bg-teal-950/50 text-teal-300 border border-teal-900/50",
        gan:
          "bg-orange-950/50 text-orange-300 border border-orange-900/50",
        vae:
          "bg-lime-950/50 text-lime-300 border border-lime-900/50",
        
        // License variants
        opensource:
          "bg-green-950/50 text-green-300 border border-green-900/50",
        commercial:
          "bg-slate-950/50 text-slate-300 border border-slate-900/50",
        
        // Performance variants
        fast:
          "bg-cyan-950/50 text-cyan-300 border border-cyan-900/50",
        optimized:
          "bg-blue-950/50 text-blue-300 border border-blue-900/50",
        
        // Outline variants with better contrast
        outline:
          "bg-transparent text-zinc-300 border border-zinc-700",
        ghost:
          "bg-zinc-900/30 text-zinc-300 border-0",
      },
      size: {
        xs: "px-1.5 py-0.5 text-[10px] gap-0.5",
        sm: "px-2 py-0.5 text-[11px] gap-1",
        default: "px-2.5 py-1 text-xs gap-1",
        lg: "px-3 py-1.5 text-sm gap-1.5",
      },
      rounded: {
        none: "",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, rounded, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, rounded }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
