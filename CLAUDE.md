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

The application uses **multiple specialized Zustand stores** organized by domain:

- **`lib/stores/data-store.ts`** - Core industrial data with CRUD operations:

  - Cycles, swirl data, blowchart values
  - Variable status management and computed health summaries
  - Seeded random data generation for consistent SSR/CSR
  - Real-time data refresh simulation

- **`lib/stores/timeline-store.ts`** - Timeline navigation and date handling:

  - Current date/time position and week-based navigation
  - Cycle selection and search functionality
  - Automatic scrolling to specific dates/times

- **`lib/stores/ui-store.ts`** - UI state management with persistence:
  - Sidebar, modals, and active menu state
  - Filtering system (turbine, status, date filters)
  - View preferences with localStorage persistence
  - Theme and display settings

Each store follows reactive patterns with computed properties and middleware integration.

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
- **Build Configuration:** ESLint and TypeScript errors ignored during builds (next.config.mjs)
- **Multi-Page Architecture:** Uses page-based components in `components/pages/` for different dashboard views
- **International UI:** Korean text content for industrial terminology and variable groups
- **Seeded Data Generation:** Consistent mock data using SeededRandom class for SSR/CSR compatibility
- **Store Persistence:** UI preferences persist via Zustand middleware with localStorage
- **Path Aliases:** `@/*` maps to project root for clean imports

## Development Workflow

When working on features:

1. **State Management**: Update appropriate store in `lib/stores/` (data-store, timeline-store, or ui-store)
2. **Components**: Create/modify components following established shadcn/ui patterns
3. **Data Integration**: Use existing SeededRandom generators in `lib/data.ts` or extend them
4. **Styling**: Leverage CSS variables system and Tailwind classes
5. **Page Structure**: For new views, add page components to `components/pages/`
6. **Testing**: Manual testing only - no automated test framework available

## Common Tasks

**Adding New Charts:** Extend chart components using Recharts/ApexCharts patterns established in existing chart components
**State Updates:** Modify the appropriate store in `lib/stores/` following existing reactive patterns and middleware usage
**New Dashboard Pages:** Add page components to `components/pages/` and register in the page index file
**Data Mock Generation:** Extend SeededRandom generators in `lib/data.ts` for consistent data across environments
**UI Components:** Utilize existing shadcn/ui components from `components/ui/` before creating custom ones
**Variable Groups:** When adding new sensor categories, update Korean group names in data model ("진동", "연소", "전기", "단위기기")
