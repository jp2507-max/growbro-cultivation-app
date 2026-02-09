# Tech Stack

## Core Framework

- **Expo SDK 54** with React Native 0.81.5
- **React 19.1.0** with React Compiler enabled
- **TypeScript 5.9.3** (strict mode)
- **Expo Router v6** for file-based navigation with typed routes

## State Management

- **React Query (@tanstack/react-query)**: Server state, data fetching, caching
- **Zustand**: Global client state management
- **React Context**: Component-level state sharing

## Database & Backend

- **InstantDB (@instantdb/react-native)**: Real-time database with offline support
- **AsyncStorage**: Session persistence and local storage

## UI & Styling

- **NativeWind 4.2.1**: Tailwind CSS for React Native
- **Tailwind CSS 3.4.17**: Utility-first styling
- **React Native Reanimated 4.1.1**: High-performance animations
- **React Native Gesture Handler 2.28.0**: Touch gesture system
- **React Native Worklets 0.5.1**: UI thread JavaScript execution
- **Expo Symbols**: Native SF Symbols support
- **Lucide React Native**: Icon library

## Performance

- **@shopify/flash-list**: Optimized list rendering
- **React Compiler**: Automatic memoization and optimization
- **New Architecture**: Enabled for improved performance

## Development Tools

- **ESLint 9.39.2**: Code linting with extensive plugins
- **Prettier 3.8.1**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files

## Common Commands

### Development

```bash
# Start development server with tunnel
npm start

# Start web development
npm run start-web

# Start web with debug logs
npm run start-web-dev
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format

# Run all checks
npm run check-all
```

### Package Management

```bash
# Install new packages (always use this for Expo compatibility)
npx expo install <package-name>
```

## Build Configuration

- **Babel**: React Compiler plugin enabled
- **TypeScript**: Strict mode with path aliases (@/\*)
- **Metro**: Default Expo bundler configuration
- **EAS**: Project ID configured for builds and updates

## Key Dependencies

- **@rork-ai/toolkit-sdk**: Rork AI integration
- **expo-image**: Optimized image component
- **expo-haptics**: Haptic feedback
- **expo-location**: Location services
- **expo-image-picker**: Image selection
- **clsx + tailwind-merge**: Utility class merging
