'use client'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { Heading } from '@/components/ui/heading'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroProps {
  title: string
  subtitle?: string
  description?: string
  primaryAction?: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
  className?: string
  centered?: boolean
}

export function Hero({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  className,
  centered = true
}: HeroProps) {
  return (
    <section className={cn(
      'relative min-h-[80vh] flex items-center py-20',
      className
    )}>
      {/* Background Effects - Subtle blur only, no gradients */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
      
      <Container className="relative z-10">
        <div className={cn(
          'max-w-4xl',
          centered && 'mx-auto text-center'
        )}>
          {subtitle && (
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white/60 uppercase tracking-wider">
                {subtitle}
              </span>
            </div>
          )}
          
          <Heading level={1} className="mb-6">
            {title}
          </Heading>
          
          {description && (
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryAction && (
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100"
                  asChild
                >
                  <a href={primaryAction.href}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              
              {secondaryAction && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                  asChild
                >
                  <a href={secondaryAction.href}>
                    {secondaryAction.label}
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
