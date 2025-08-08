import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  id?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const paddings = {
  none: '',
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-20 lg:py-24',
  xl: 'py-20 sm:py-24 lg:py-32'
}

export function Section({ 
  children, 
  className,
  id,
  padding = 'lg'
}: SectionProps) {
  return (
    <section 
      id={id}
      className={cn(
        'w-full',
        paddings[padding],
        className
      )}
    >
      {children}
    </section>
  )
}
