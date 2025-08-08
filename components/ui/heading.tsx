import { cn } from '@/lib/utils'

interface HeadingProps {
  children: React.ReactNode
  className?: string
  level?: 1 | 2 | 3 | 4
}

export function Heading({ 
  children, 
  className,
  level = 2
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  
  const styles = {
    1: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight',
    2: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight',
    3: 'text-2xl sm:text-3xl font-semibold',
    4: 'text-xl sm:text-2xl font-medium'
  }
  
  return (
    <Tag className={cn(
      styles[level],
      'text-white',
      className
    )}>
      {children}
    </Tag>
  )
}
