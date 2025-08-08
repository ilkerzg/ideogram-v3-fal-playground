// Navigation Types
export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

// Section Types
export interface SectionData {
  id: string
  title: string
  subtitle?: string
  description?: string
  content?: React.ReactNode
}

// Button Action Types
export interface ActionButton {
  label: string
  href: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline-solid'
  icon?: React.ComponentType<{ className?: string }>
}

// Card Types
export interface CardData {
  id: string
  title: string
  description?: string
  image?: string
  badge?: string
  link?: string
}

// Feature Types
export interface Feature {
  id: string
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
}

// Testimonial Types
export interface Testimonial {
  id: string
  name: string
  role?: string
  company?: string
  content: string
  avatar?: string
  rating?: number
}

// FAQ Types
export interface FAQ {
  id: string
  question: string
  answer: string
}

// Contact Types
export interface ContactInfo {
  email?: string
  phone?: string
  address?: string
  socials?: SocialLink[]
}

export interface SocialLink {
  platform: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
}

// Project Types (for reuse)
export interface ProjectConfig {
  name: string
  logo?: string
  description: string
  navigation: NavItem[]
  sections: SectionData[]
  footer?: {
    links: NavItem[]
    copyright?: string
  }
  theme?: {
    accent?: string
    dark?: boolean
  }
}

// FAL API Types
export interface FalImage {
  url: string
  content_type?: string
  file_name?: string
  file_size?: number
}

export interface FalAsyncStatus {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  request_id?: string
  response_url?: string
  status_url?: string
  cancel_url?: string
  logs?: Array<{ message?: string; level?: string }>
  metrics?: Record<string, unknown>
  error?: { message?: string; code?: string }
}

export interface FalFinalResponse {
  data?: {
    images?: FalImage[]
    seed?: number
  }
  images?: FalImage[]
  image?: { url?: string } | string
  output?: { url?: string } | string
  requestId?: string
}
