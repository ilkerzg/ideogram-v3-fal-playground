/**
 * Template Manager - Scalable template system
 * Automatically loads templates from file system or configuration
 */

export interface Template {
  id: string
  url: string
  name: string
  category: TemplateCategory
  description: string
  tags?: string[]
  createdAt?: string
}

export enum TemplateCategory {
  PROFESSIONAL = "Professional",
  LIFESTYLE = "Lifestyle",
  FASHION = "Fashion",
  BEAUTY = "Beauty",
  ARTISTIC = "Artistic",
  PORTRAIT = "Portrait",
  CASUAL = "Casual",
  FORMAL = "Formal",
  CREATIVE = "Creative",
  VINTAGE = "Vintage",
  MODERN = "Modern",
  EDITORIAL = "Editorial"
}

// Template configuration - easily add new templates here
const TEMPLATE_CONFIG: Omit<Template, 'url'>[] = [
  {
    id: "prof-001",
    name: "Business Executive",
    category: TemplateCategory.PROFESSIONAL,
    description: "Professional business portrait for executives",
    tags: ["business", "corporate", "executive", "professional"],
  },
  {
    id: "prof-002",
    name: "LinkedIn Professional",
    category: TemplateCategory.PROFESSIONAL,
    description: "Perfect for LinkedIn profile photos",
    tags: ["linkedin", "professional", "headshot", "corporate"],
  },
  {
    id: "prof-003",
    name: "Corporate Headshot",
    category: TemplateCategory.PROFESSIONAL,
    description: "Standard corporate headshot style",
    tags: ["corporate", "headshot", "business", "formal"],
  },
  {
    id: "life-001",
    name: "Outdoor Adventure",
    category: TemplateCategory.LIFESTYLE,
    description: "Natural outdoor lifestyle portrait",
    tags: ["outdoor", "nature", "adventure", "casual"],
  },
  {
    id: "life-002",
    name: "Urban Street",
    category: TemplateCategory.LIFESTYLE,
    description: "Urban street style portrait",
    tags: ["street", "urban", "city", "casual"],
  },
  {
    id: "life-003",
    name: "Coffee Shop Casual",
    category: TemplateCategory.LIFESTYLE,
    description: "Relaxed coffee shop environment",
    tags: ["casual", "coffee", "relaxed", "lifestyle"],
  },
  {
    id: "fash-001",
    name: "High Fashion",
    category: TemplateCategory.FASHION,
    description: "High fashion editorial style",
    tags: ["fashion", "editorial", "model", "glamour"],
  },
  {
    id: "fash-002",
    name: "Runway Model",
    category: TemplateCategory.FASHION,
    description: "Professional runway model pose",
    tags: ["runway", "model", "fashion", "professional"],
  },
  {
    id: "fash-003",
    name: "Fashion Editorial",
    category: TemplateCategory.FASHION,
    description: "Magazine editorial style portrait",
    tags: ["editorial", "magazine", "fashion", "style"],
  },
  {
    id: "beauty-001",
    name: "Natural Beauty",
    category: TemplateCategory.BEAUTY,
    description: "Soft natural beauty portrait",
    tags: ["beauty", "natural", "soft", "portrait"],
  },
  {
    id: "beauty-002",
    name: "Glamour Shot",
    category: TemplateCategory.BEAUTY,
    description: "Professional glamour photography",
    tags: ["glamour", "beauty", "professional", "portrait"],
  },
  {
    id: "beauty-003",
    name: "Skin Care",
    category: TemplateCategory.BEAUTY,
    description: "Clean beauty and skin care focused",
    tags: ["skincare", "beauty", "clean", "fresh"],
  },
  {
    id: "art-001",
    name: "Abstract Portrait",
    category: TemplateCategory.ARTISTIC,
    description: "Creative abstract portrait style",
    tags: ["abstract", "artistic", "creative", "unique"],
  },
  {
    id: "art-002",
    name: "Double Exposure",
    category: TemplateCategory.ARTISTIC,
    description: "Artistic double exposure effect",
    tags: ["double-exposure", "artistic", "creative", "effect"],
  },
  {
    id: "art-003",
    name: "Surreal Portrait",
    category: TemplateCategory.ARTISTIC,
    description: "Surrealistic portrait style",
    tags: ["surreal", "artistic", "creative", "fantasy"],
  },
  {
    id: "port-001",
    name: "Classic Portrait",
    category: TemplateCategory.PORTRAIT,
    description: "Traditional portrait photography",
    tags: ["classic", "portrait", "traditional", "timeless"],
  },
  {
    id: "port-002",
    name: "Environmental Portrait",
    category: TemplateCategory.PORTRAIT,
    description: "Portrait in natural environment",
    tags: ["environmental", "portrait", "natural", "context"],
  },
  {
    id: "port-003",
    name: "Studio Portrait",
    category: TemplateCategory.PORTRAIT,
    description: "Professional studio lighting",
    tags: ["studio", "portrait", "professional", "lighting"],
  },
  {
    id: "vintage-001",
    name: "Retro 80s",
    category: TemplateCategory.VINTAGE,
    description: "80s retro style portrait",
    tags: ["retro", "80s", "vintage", "nostalgic"],
  },
  {
    id: "vintage-002",
    name: "Film Noir",
    category: TemplateCategory.VINTAGE,
    description: "Classic film noir aesthetic",
    tags: ["film-noir", "vintage", "classic", "dramatic"],
  },
];

// Auto-generated templates (gen-001..gen-040) so they appear in carousel and browser
const GENERATED_CONFIG: Omit<Template, 'url'>[] = Array.from({ length: 40 }, (_, index) => {
  const number = String(index + 1).padStart(3, "0")
  return {
    id: `gen-${number}`,
    name: `Generated Portrait ${number}`,
    category: TemplateCategory.PORTRAIT,
    description: `AI generated portrait ${number}`,
    tags: ["generated", "portrait"],
  }
})

// Additional batch (gen-061..gen-100)
const GENERATED_CONFIG_2: Omit<Template, 'url'>[] = Array.from({ length: 40 }, (_, index) => {
  const number = String(index + 61).padStart(3, "0")
  return {
    id: `gen-${number}`,
    name: `Generated Portrait ${number}`,
    category: TemplateCategory.PORTRAIT,
    description: `AI generated portrait ${number}`,
    tags: ["generated", "portrait"],
  }
})


/**
 * Generate template URL based on ID
 * This can be modified to load from different sources:
 * - Local files in /public/templates/
 * - CDN URLs
 * - External API
 * - Database
 */
function generateTemplateUrl(templateId: string): string {
  // Always use local path; client will fallback via onError using getRemoteTemplateUrl
  return `/templates/${templateId}.jpg`
}

/**
 * Check if local image exists (client-side)
 * In production, this could be an API call or build-time check
 */
function checkLocalImage(templateId: string): boolean {
  if (typeof window === 'undefined') {
    try {
      // Node.js during build: verify files
      const fs = require('node:fs') as typeof import('node:fs')
      const path = require('node:path') as typeof import('node:path')
      const publicDir = path.join(process.cwd(), 'public', 'templates')
      return fs.existsSync(path.join(publicDir, `${templateId}.jpg`)) || fs.existsSync(path.join(publicDir, `${templateId}.png`))
    } catch {
      return false
    }
  }
  // Browser runtime: cannot stat, assume not present to use remote until downloaded
  return false
}

/**
 * Get all templates with generated URLs
 */
export function getAllTemplates(): Template[] {
  const allConfigs = [...TEMPLATE_CONFIG, ...GENERATED_CONFIG, ...GENERATED_CONFIG_2]
  const mapped = allConfigs.map(config => ({
    ...config,
    url: generateTemplateUrl(config.id),
    createdAt: config.createdAt || new Date().toISOString(),
  }));
  // Ensure each image URL is used only once
  const seenUrls = new Set<string>()
  const uniqueByUrl: Template[] = []
  for (const t of mapped) {
    if (seenUrls.has(t.url)) continue
    seenUrls.add(t.url)
    uniqueByUrl.push(t)
  }
  return uniqueByUrl
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return getAllTemplates().filter(t => t.category === category);
}

/**
 * Get all free templates (all templates are free in this open source app)
 */
export function getFreeTemplates(): Template[] {
  return getAllTemplates();
}

/**
 * Search templates by name, tags, or description
 */
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return getAllTemplates().filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return getAllTemplates().find(t => t.id === id);
}

/**
 * Get unique categories
 */
export function getCategories(): TemplateCategory[] {
  return Object.values(TemplateCategory);
}

/**
 * Get template count by category
 */
export function getTemplateCounts(): Record<TemplateCategory, number> {
  const templates = getAllTemplates();
  const counts: Partial<Record<TemplateCategory, number>> = {};
  
  templates.forEach(t => {
    counts[t.category] = (counts[t.category] || 0) + 1;
  });
  
  return counts as Record<TemplateCategory, number>;
}

/**
 * Load templates from external source (for future implementation)
 * This could load from:
 * - API endpoint
 * - Database
 * - CMS
 * - JSON file
 */
export async function loadTemplatesFromSource(): Promise<Template[]> {
  // For now, return static templates
  // In production, this would fetch from your data source
  return getAllTemplates();
}

/**
 * Add custom template (for user uploads or dynamic templates)
 */
export function createCustomTemplate(
  name: string,
  imageUrl: string,
  category: TemplateCategory = TemplateCategory.PORTRAIT
): Template {
  return {
    id: `custom-${Date.now()}`,
    url: imageUrl,
    name,
    category,
    description: `Custom template: ${name}`,
    tags: ["custom", "user-uploaded"],
    createdAt: new Date().toISOString(),
  };
}
