---
trigger: always_on
---

# React Native/Expo Project

You are an expert in TypeScript, React Native, Expo, and Mobile UI development with Nativewind.

Every time you choose to apply a rule(s), explicitly state the rule(s) in the output. You can abbreviate the rule description to a single word or phrase.

## Project Context

GrowBro — a mobile app for home cannabis growers. Fresh codebase (not the old Obytes-starter project).

## Code Style and Structure

- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Ensure components are modular, reusable, and maintainable.
- Component Modularity: Break down components into smaller, reusable pieces. Keep components focused on a single responsibility.
- To install new packages use `bunx expo install <package-name>`

## Tech Stack

Core: Expo 54, React Native 0.81, TypeScript, NativeWind 5 (Tailwind CSS v4, react-native-css), Expo Router v6.
State: @tanstack/react-query, Zustand.
Database: InstantDB (`@instantdb/react-native`) with MMKV offline store.
UI: @shopify/flash-list, react-native-reanimated 4, react-native-gesture-handler, react-native-worklets, expo-image, lucide-react-native.
Compiler: React Compiler enabled (babel-plugin-react-compiler + app.json `experiments.reactCompiler`).
Monitoring: @sentry/react-native (planned — not yet installed).

For exact versions, check `package.json`.

## InstantDB Integration

- Schema defined in `instant.schema.ts` (entities, links, types)
- Permissions defined in `instant.perms.ts`
- Client initialized in `src/lib/instant.ts` via `init({ appId, schema, Store })`
- Auth uses magic-code flow: `db.auth.sendMagicCode()` / `db.auth.signInWithMagicCode()`
- Queries via `db.useQuery()`, transactions via `db.transact()`
- Environment variable: `EXPO_PUBLIC_INSTANT_APP_ID` (accessed via `process.env`)
- MMKV used for session persistence (`@instantdb/react-native-mmkv`)

### InstantDB CLI

```bash
npx instant-cli@latest login          # Authenticate with Instant account
npx instant-cli@latest push schema    # Push instant.schema.ts to production
npx instant-cli@latest push perms     # Push instant.perms.ts to production
npx instant-cli@latest pull           # Pull latest schema + perms from production
npx instant-cli@latest init           # Scaffold instant.schema.ts + instant.perms.ts
```

- The CLI auto-detects `EXPO_PUBLIC_INSTANT_APP_ID` from `.env` for Expo apps.
- For CI, set `INSTANT_CLI_AUTH_TOKEN` (obtain via `npx instant-cli@latest login -p`).

## Sentry (Planned)

- Will use `@sentry/react-native` for crash reporting and performance monitoring once installed.

## React Compiler

- Enabled in `babel.config.js` (`babel-plugin-react-compiler`) and `app.json` (`experiments.reactCompiler: true`).
- ESLint plugin `eslint-plugin-react-compiler` enforces compiler-safe patterns.
- For Reanimated shared values: use `.get()/.set()` in React render/JS-thread code; `.value` only inside genuine worklets.

## Naming Conventions

- Favor named exports for components and utilities
- Use kebabCase for all file names and directories (e.g., add-plant.tsx)

## TypeScript Usage

- Use TypeScript for all code; prefer types over interfaces
- Avoid enums; use const objects with 'as const' assertion
- Use functional components with TypeScript types
- Define strict types for message passing between different parts of the app
- Use absolute imports for all files @/...
- Avoid try/catch blocks unless there's good reason to translate or handle error in that abstraction
- Use explicit return types for all functions

## State Management

- Use Zustand for global state management
- Use @tanstack/react-query for server state / caching
- Implement proper cleanup in useEffect hooks

## Syntax and Formatting

- Use "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals
- Use declarative JSX
- Implement proper TypeScript discriminated unions for message types

## UI and Styling

- Use NativeWind v5 for styling (CSS-first config in `global.css`, no `tailwind.config.js`)
- Components using `className` must be imported from `@/src/tw` (View, Text, Pressable, etc.), `@/src/tw/image` (Image), or `@/src/tw/animated` (Animated.View)
- Use `useColorScheme` from `react-native` (not from `nativewind`)
- Use built-in UI components from `@/src/components/ui`
- Use native iOS/Android presentation APIs (formSheet, modal) instead of JS bottom-sheet libraries
- Use `Image` from `@/src/tw/image` for all image rendering (CSS-wrapped expo-image)
- Use `lucide-react-native` for icons
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props
- Leverage react-native-reanimated and react-native-gesture-handler for performant animations and gestures
- Avoid unnecessary re-renders by memoizing components and using useMemo and useCallback hooks appropriately
- Color tokens defined in `global.css` `@theme` block; JS mirror in `constants/colors.ts`

## Error Handling

- Log errors appropriately for debugging
- Provide user-friendly error messages

## Testing

- Write unit tests using Jest and React Native Testing Library (test infra not yet installed — will be set up when needed)
- Write unit tests for utilities and complex components
- The test file should be named like the component file but with the .test.tsx extension (e.g., component-name.test.tsx)
- Do not write unit tests for simple components that only show data

## Git

Use conventional commits (fix:, feat:, perf:, docs:, style:, refactor:, test:, chore:). Lowercase, max 100 chars.
