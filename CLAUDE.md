# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 15.5.4** application using:

- **React 19.1.0** with TypeScript
- **Tailwind CSS v4** (new PostCSS architecture)
- **App Router** architecture (Next.js App directory)
- **Turbopack** build tool for faster development and builds
- **class-variance-authority** and **clsx** for utility class management
- **lucide-react** for icons

## Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Production build (with Turbopack)
npm run build

# Start production server
npm start

# Lint code
npm run lint
# or with ESLint directly
npx eslint .
```

## Architecture

### App Router Structure

- **`app/`** - App Router directory (Next.js 13+ architecture)
  - `layout.tsx` - Root layout with font configuration (Geist Sans & Geist Mono)
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind CSS v4 and design system tokens

### TypeScript Configuration

- **Path Alias**: `@/*` maps to project root (e.g., `@/app/page.tsx`)
- **Strict mode enabled** with ES2017 target
- **Module resolution**: `bundler` mode

### Styling Architecture

This project uses **Tailwind CSS v4** with a comprehensive design system:

**Theme System**:

- Uses CSS custom properties (`--color-*`, `--radius-*`) for design tokens
- Supports light/dark mode via `.dark` class
- Design system includes: primary, secondary, muted, accent, destructive, sidebar, chart colors
- Border radius system: `sm`, `md`, `lg`, `xl` variants

**Color System**:

- Uses OKLCH color space for consistent, perceptually uniform colors
- All colors defined as CSS variables in `:root` and `.dark` for theme switching
- Extensive chart palette (`--chart-1` through `--chart-5`)
- Sidebar-specific color system for consistent sidebar theming

**PostCSS Configuration**:

- Uses `@tailwindcss/postcss` plugin for Tailwind v4
- Includes `tw-animate-css` for additional animation utilities
- Custom dark mode variant: `@custom-variant dark (&:is(.dark *))`

**Utilities**:

- `tailwind-merge` (via `clsx`) for conditional/merged class handling
- `class-variance-authority` for type-safe component variants

### Key Development Notes

1. **Turbopack**: Both dev and build commands use `--turbopack` flag for faster compilation
2. **Font Optimization**: Uses `next/font` for automatic Geist font family optimization
3. **No Traditional Tailwind Config**: Tailwind v4 uses CSS-first configuration in `globals.css`
4. **ESLint**: Uses Next.js recommended configs (`next/core-web-vitals`, `next/typescript`)

### Component Patterns

When creating new components in this project:

- Place React components in `app/` for pages or create a `components/` directory for reusable components
- Use TypeScript with proper type definitions
- Follow the existing styling pattern using Tailwind CSS utilities
- Leverage the design system tokens defined in `globals.css`
- Use `clsx` or `cn()` utility for conditional classes
- Use `lucide-react` for icons (already installed)

### Important Implementation Details

**Image Optimization**:

- Use `next/image` for all images (see `app/page.tsx` for examples)
- Static assets go in `public/` directory

**Metadata**:

- Define page metadata using Next.js Metadata API in layout or page files
- See `app/layout.tsx` for example structure

**TypeScript**:

- All new files should use `.tsx` for components and `.ts` for utilities
- Follow strict TypeScript patterns (strict mode enabled)
