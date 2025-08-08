# Project Rules

This repository is a focused face-editing app: Ideogram V3 Character Edit — Powered by FAL. Use these rules as an IDE prompt for implementing or reviewing code.

## Scope
- Single feature: face edit with masked regions based on a reference image
- UI route: `/face-swap` (root redirects here)
- Templates: served from `public/templates/<id>.jpg`
- No external template URLs in UI; local-only rendering

## Architecture
- Next.js App Router, TypeScript strict
- Tailwind + shadcn/ui components
- Keep components small and cohesive; colocate feature components under `components/face-swap/`
- Library code under `lib/` must be framework-agnostic and fully typed

## Data & Assets
- Do not hardcode remote template URLs in UI
- When generating, upload local assets to FAL first, then pass the returned URL
- Avoid introducing new runtime external dependencies without approval

## Coding Standards
- Prefer explicit types on exported functions and component props
- Handle unions safely (no unchecked `any`); use narrow checks
- Early return for guards; keep nesting shallow
- No unused code, dead branches, or commented-out blocks
- Strings, classNames, and Tailwind utilities should be readable and minimal

## UI/UX
- Dialogs: centered, scroll-locked, not dismissible by overlay/ESC unless explicitly allowed
- Mobile-first; ensure controls remain accessible and tappable
- Avoid layout shift; constrain images with aspect-aware containers
- Loading/disabled states for network actions

## Security & Privacy
- Never log secrets
- API key persisted only in localStorage key `fal_api_key`
- All fetches to protected FAL endpoints must send `Authorization: Key <API_KEY>`
- Sanitize/validate any dynamic values sent to APIs

## Performance
- Minimize client state and rerenders; memoize heavy components
- Prefer static assets from `public/` and cache where safe
- Avoid large, un-splittable dependencies

## Error Handling
- Surface actionable toast messages; include a concise description
- Exhaustively parse model responses: `data.images`, `images`, `image`, `output`
- Never throw unhandled errors from UI; fail gracefully

## File Structure (essentials)
```
app/
  face-swap/
  layout.tsx
components/
  face-swap/
  ui/
lib/
  template-manager.ts
  fal-client.ts
public/
  templates/
```

## Git & Code Review
- Small atomic edits; descriptive commit messages
- Keep diffs focused to the task; avoid drive-by refactors
- Follow existing patterns and naming; prefer consistency over novelty

## Done Criteria
- Type-check passes
- Lint passes
- UI works on mobile and desktop
- No remote URLs in template rendering
- Image generation succeeds with local templates (auto-uploaded before requests) 