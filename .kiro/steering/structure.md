# Project Structure

## Root Organization

```
/
├── app/                    # Expo Router file-based routing
├── src/                    # Source code (components, lib, utilities)
├── assets/                 # Static assets (images, fonts)
├── .agent/                 # Agent rules and skills
├── .kiro/                  # Kiro steering and specs
└── [config files]          # Root configuration files
```

## App Directory (Expo Router v6)

File-based routing with typed routes enabled.

```
app/
├── (tabs)/                 # Tab-based navigation group
├── _layout.tsx             # Root layout
├── +native-intent.tsx      # Native intent handler
├── +not-found.tsx          # 404 page
├── add-plant.tsx           # Modal: Add plant
├── age-gate.tsx            # Age verification screen
├── ai-diagnosis.tsx        # AI photo assessment
├── harvest.tsx             # Harvest workflow
├── instant-demo.tsx        # InstantDB demo
├── onboarding.tsx          # User onboarding flow
├── profile.tsx             # User profile
├── strain-detail.tsx       # Strain details
├── task-detail.tsx         # Task details
└── welcome.tsx             # Welcome/landing screen
```

### Routing Conventions

- **Folders with parentheses** `(tabs)`: Layout groups without affecting URL
- **Files with plus** `+not-found.tsx`: Special route handlers
- **Underscore prefix** `_layout.tsx`: Layout files
- **kebab-case**: All file and folder names

## Source Directory

```
src/
├── components/
│   └── ui/                 # Reusable UI components
│       └── colors.js       # Color tokens (SSOT for theme)
└── lib/
    ├── animations/         # Animation utilities and tokens
    ├── crypto-polyfill.ts  # Crypto polyfills for React Native
    ├── instant.ts          # InstantDB configuration
    └── utils.ts            # Shared utilities (cn, etc.)
```

## Configuration Files

### TypeScript

- `tsconfig.json`: Strict mode, path aliases (@/\*)

### Styling

- `tailwind.config.js`: NativeWind configuration with custom color tokens
- `src/components/ui/colors.js`: Single source of truth for colors

### Linting & Formatting

- `eslint.config.mjs`: Flat config with extensive plugins
- `.prettierrc`: Code formatting rules
- `.husky/`: Git hooks for pre-commit checks

### Expo & React Native

- `app.json`: Expo configuration, bundle IDs, plugins
- `package.json`: Dependencies and scripts
- `babel.config.js`: React Compiler plugin

## Naming Conventions

### Files & Folders

- **kebab-case** for all files: `add-plant.tsx`, `task-detail.tsx`
- **Component files**: Match component name in kebab-case
- **Test files**: `component-name.test.tsx` (co-located with source)
- **Hooks**: `use-*.ts` or `use-*.tsx`
- **Services**: `*.service.ts`

### Code

- **Named exports** preferred over default exports
- **Functional components** with TypeScript types
- **Types over interfaces** for TypeScript definitions

## Import Paths

Use absolute imports with `@/*` alias:

```typescript
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from '@/lib/animations/motion';
```

## Component Organization

### UI Components (`src/components/ui/`)

- Reusable, atomic UI components
- Must forward `className` prop via `cn()` utility
- Co-located with component-specific utilities

### Screen Components (`app/`)

- Route-level components
- Can be up to 150 lines (ESLint configured)
- Handle screen-specific logic and layout

## Animation Files

Located in `src/lib/animations/`:

- `motion.ts`: Duration and easing tokens
- `shared.ts`: Shared transition configurations
- Helper functions for Reduced Motion support

## Agent & Kiro Directories

### `.agent/`

- `rules/`: Project-wide coding rules and guidelines
- `skills/`: Specialized agent capabilities and documentation

### `.kiro/`

- `steering/`: Context and guidance for AI assistants
- `specs/`: Feature specifications and implementation plans

## Asset Organization

```
assets/
└── images/
    ├── icon.png            # App icon
    ├── splash-icon.png     # Splash screen
    ├── adaptive-icon.png   # Android adaptive icon
    └── favicon.png         # Web favicon
```

## Key Architectural Patterns

### State Management

- **Server state**: React Query for API data, caching, mutations
- **Global state**: Zustand stores for app-wide state
- **Local state**: React hooks (useState, useReducer)
- **Form state**: React Hook Form + Zod validation

### Styling Strategy

- **Static styles**: Tailwind classes via `className`
- **Dynamic styles**: Reanimated `useAnimatedStyle` via `style` prop
- **Theme**: NativeWind dark mode with explicit light/dark pairs
- **Tokens**: Import from `src/components/ui/colors.js`

### Code Organization

- **Modular components**: Single responsibility, max ~110 lines
- **Functional patterns**: Avoid classes, prefer pure functions
- **Type safety**: Explicit return types, strict TypeScript
- **No circular imports**: Enforced by ESLint
