import { cn } from '@/lib/utils'

interface CardEnhancedProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function CardEnhanced({ 
  children, 
  className,
  hover = false,
  glow = false
}: CardEnhancedProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg border border-border bg-black/50 backdrop-blur-sm',
      hover && 'hover:border-white/20 hover:shadow-lg hover:shadow-white/5',
      glow && 'shadow-lg shadow-white/5',
      className
    )}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
