# Ideogram V3 Character Edit — Powered by FAL

A focused, production-ready face-editing experience. Upload a reference portrait, pick a template, paint the mask, and generate a consistent result using Ideogram V3 via FAL.

## Features
- Face edit with masked regions (keep background, edit face)
- Local template gallery (served from `public/templates`)
- Automatic upload of local assets to FAL before generation
- Mobile-friendly UI and persistent result dialog
- Clean dark UI with shadcn/ui + Tailwind

## Tech Stack
- Next.js (App Router), TypeScript
- Tailwind CSS, shadcn/ui
- FAL client for model execution

## Getting Started
1. Install deps
   ```bash
   pnpm install
   ```
2. Run dev
   ```bash
   pnpm dev
   ```
3. Open the app
   - The home (`/`) redirects to `/face-swap`.

## FAL API Key
- Configure in-app: click “API Key” (top-right) and paste your key
- Or set an env var (optional):
  ```bash
  NEXT_PUBLIC_FAL_KEY=your_key_here
  ```

## Usage
1. Select a template from the carousel or Browse
2. Upload your reference image
3. Paint the mask (areas to edit)
4. Click Generate
5. Result dialog opens and stays until closed

## Local Images Only
- Templates come from `public/templates/<id>.jpg`
- When generating, local images are uploaded to FAL storage automatically and used as URLs

## Scripts
```bash
pnpm dev       # Start dev server
pnpm build     # Production build
pnpm start     # Start production server
pnpm lint      # ESLint
pnpm type-check# TypeScript
```

## Project Layout (essentials)
```
app/
  face-swap/           # Main feature page
  layout.tsx           # Global layout & metadata
components/
  face-swap/           # Feature components (upload, canvas, dialogs)
  ui/                  # shadcn/ui
lib/
  template-manager.ts  # Local template config (public paths)
  fal-client.ts        # FAL client helpers
public/
  templates/           # Local template images
  og2.png              # Social preview image
```

## Notes
- The app avoids remote placeholders; only local templates are used in UI.
- On generation, any local asset is uploaded to FAL first, then used by the model.

## License
MIT — use freely in your projects.
