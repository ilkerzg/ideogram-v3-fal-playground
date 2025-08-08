import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Ideogram V3 Character Edit — Powered by FAL',
  description: 'Face swap and character edit with Ideogram V3.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    title: 'Ideogram V3 Character Edit — Powered by FAL',
    description: 'Face swap and character edit with Ideogram V3.',
    siteName: 'Ideogram V3 Character Edit',
    images: ['/og2.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ideogram V3 Character Edit — Powered by FAL',
    description: 'Face swap and character edit with Ideogram V3.',
    images: ['/og2.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(
        spaceGrotesk.variable,
        'min-h-screen bg-background font-sans antialiased',
        'lg:h-screen lg:overflow-hidden'
      )}>
        {children}
      </body>
    </html>
  )
}
