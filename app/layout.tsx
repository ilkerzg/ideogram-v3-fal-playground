import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { cn } from '@/lib/utils'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: {
    default: 'Face Swapper - Ideogram V3 — Powered by FAL',
    template: '%s | Face Swapper',
  },
  description:
    "Swap faces into stunning templates in seconds. Upload a face and apply it to curated portraits with precise inpainting and masking. Fast, privacy-friendly, and powered by FAL.",
  keywords: [
    'AI face swap',
    'face swap',
    'image editing',
    'inpainting',
    'portrait templates',
    'character edit',
    'FAL AI',
    'Ideogram',
    'computer vision',
    'image generation',
  ],
  authors: [{ name: 'FAL AI' }],
  creator: 'FAL AI',
  publisher: 'FAL AI',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: [
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Face Swapper — Ideogram V3 — Powered by FAL',
    description:
      'Swap faces into stunning templates in seconds. Upload a face and apply it to curated portraits with precise inpainting and masking.',
    siteName: 'Face Swapper',
    images: [
      {
        url: '/og2.png',
        width: 1200,
        height: 630,
        alt: 'Face Swapper — AI Face Swap Demo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Face Swapper — Ideogram V3 — Powered by FAL',
    description:
      'Swap faces into stunning templates in seconds. Upload a face and apply it to curated portraits with precise inpainting and masking.',
    creator: '@fal_ai',
    site: '@fal_ai',
    images: [
      {
        url: '/og2.png',
        width: 1200,
        height: 630,
        alt: 'Face Swapper — AI Face Swap Demo',
        type: 'image/png',
      },
    ],
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
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-title" content="FAL" />
      </head>
      <body className={cn(
        spaceGrotesk.variable,
        'min-h-screen bg-background font-sans antialiased',
        'lg:h-screen lg:overflow-hidden'
      )}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
