import { Container } from './container'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

interface FooterLink {
  label: string
  href: string
}

interface FooterProps {
  links?: FooterLink[]
  copyright?: string
}

export function Footer({ 
  links = [],
  copyright = `© ${new Date().getFullYear()} AI Model Hub. All rights reserved.`
}: FooterProps) {
  return (
    <footer className="border-t border-border bg-black">
      <Container>
        <div className="py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         
           
            
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              {copyright}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
