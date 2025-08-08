'use client'

import Link from 'next/link'
import { Sparkles, Menu, X, Cloud } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
}

interface NavigationProps {
  items?: NavItem[]
  logo?: string
}

export function Navigation({ 
  items = [],
  logo = 'AI Model Hub' 
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Default navigation items including weather app
  const defaultItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Showcase', href: '/showcase' },
    ...items
  ]
  
  const navItems = items.length > 0 ? items : defaultItems
  
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle hash links for smooth scroll
    if (href.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setMobileMenuOpen(false)
      }
    }
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-black/95 backdrop-blur-sm supports-backdrop-filter:bg-black/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-white" />
          <span className="font-bold text-xl text-white">
            {logo}
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isWeather = item.href === '/weather'
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className={cn(
                  "px-4 py-2 text-sm transition-colors flex items-center gap-2",
                  isActive 
                    ? "text-white font-medium" 
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {isWeather && <Cloud size={16} />}
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-black">
          <nav className="container py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const isWeather = item.href === '/weather'
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className={cn(
                    "block px-4 py-2 text-sm transition-colors flex items-center gap-2",
                    isActive 
                      ? "text-white font-medium" 
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {isWeather && <Cloud size={16} />}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
