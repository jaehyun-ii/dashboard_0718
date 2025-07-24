# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Development:**
- `npm run dev` - Start development server (Next.js)
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (currently configured to ignore errors during builds)

**Note:** No testing framework is currently configured in this project.

## Architecture Overview

This is a **Next.js 15 industrial dashboard application** using the App Router architecture with TypeScript. The project implements a real-time monitoring system for industrial turbines with comprehensive data visualization.

**Key Technologies:**
- **Frontend:** Next.js 15.2.4 + React 19 + TypeScript
- **Styling:** Tailwind CSS with shadcn/ui component library
- **State Management:** Zustand store in `lib/store.ts`
- **Charts:** Recharts and React ApexCharts
- **UI Components:** 30+ shadcn/ui components in `components/ui/`

## Project Structure

```
app/                    # Next.js App Router
├── layout.tsx         # Root layout with theme provider
├── page.tsx           # Main dashboard page
└── globals.css        # CSS variables and theming

components/
├── ui/                # shadcn/ui design system components
└── [features]         # Dashboard-specific components

lib/
├── store.ts           # Zustand state management (main application state)
└── utils.ts           # Utility functions

hooks/                 # Custom React hooks
```

## State Management Architecture

The application uses a **centralized Zustand store** (`lib/store.ts`) containing:
- **Timeline state:** Current timeline, selected cycles, date ranges
- **Dashboard settings:** Active charts, sidebar state, modal controls
- **Industrial data:** Turbine cycles, sensor readings, variable groups
- **UI state:** Loading states, selections, filters

State is organized into logical slices with computed properties and reactive updates.

## Data Model

**Core Entities:**
- **Cycles:** 90 days of generated turbine operation cycles (A, B, C, D turbines)
- **Variables:** Industrial sensors with health status and real-time values
- **Variable Groups:** Pressure, temperature, and swirl sensor categories
- **Chart Data:** Time-series data for visualization components

All data is currently **mock-generated** for development purposes.

## Component Patterns

**UI Components:**
- Extensive use of Radix UI primitives via shadcn/ui
- Consistent theming through CSS variables
- Responsive design with Tailwind breakpoints

**Feature Components:**
- Chart components using Recharts/ApexCharts
- Modal systems for detailed cycle information
- Timeline visualization with interactive selection
- Variable status monitoring with health indicators

## Styling System

**Theme Configuration:**
- CSS variables in `app/globals.css` for consistent theming
- Dark mode support via next-themes
- Custom color palette with semantic naming
- Animation system integrated with Tailwind

## Key Implementation Notes

- **No Testing Infrastructure:** Project lacks test files and testing framework
- **Linting Disabled:** ESLint errors are ignored during builds
- **International UI:** Text content appears to be in Korean
- **v0.dev Generated:** Components show evidence of v0.dev generation
- **Path Aliases:** `@/*` maps to project root for clean imports

## Development Workflow

When working on features:
1. Update Zustand store in `lib/store.ts` for state changes
2. Create/modify components following shadcn/ui patterns
3. Use existing mock data generators or extend them
4. Leverage the established CSS variable system for styling
5. Test manually in development mode (no automated tests available)

## Common Tasks

**Adding New Charts:** Extend chart components using Recharts patterns established in existing chart components

**State Updates:** Modify the Zustand store slices in `lib/store.ts` following the existing reactive patterns

**UI Components:** Utilize existing shadcn/ui components from `components/ui/` before creating custom ones

**Styling:** Use CSS variables and Tailwind classes following the established design system patterns