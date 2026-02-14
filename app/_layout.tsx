import '../global.css';
import '@/src/lib/i18n';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { isRunningInExpoGo } from 'expo';
import { Redirect, useNavigationContainerRef, useSegments } from 'expo-router';
import Stack from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, useColorScheme } from 'react-native';

import Colors from '@/constants/colors';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { getFormSheetPresets } from '@/src/lib/navigation/form-sheet-options';
import { recordStartupUxMetric } from '@/src/lib/observability/sentry-metrics';
import { GestureHandlerRootView, View } from '@/src/tw';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const SENTRY_RELEASE = process.env.EXPO_PUBLIC_SENTRY_RELEASE;
const SENTRY_DIST = process.env.EXPO_PUBLIC_SENTRY_DIST;
const traceTargetList = process.env.EXPO_PUBLIC_SENTRY_TRACE_TARGETS;
const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? 'development' : 'production');
const appBootStartedAt = Date.now();

const NAV_LIGHT_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.danger,
  },
};

const NAV_DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primaryBright,
    background: Colors.darkBg,
    card: Colors.darkBgCard,
    text: Colors.textPrimaryDark,
    border: Colors.darkBorder,
    notification: Colors.errorDark,
  },
};

function getTracePropagationTargets(): (string | RegExp)[] {
  if (
    typeof traceTargetList === 'string' &&
    traceTargetList.trim().length > 0
  ) {
    return traceTargetList
      .split(',')
      .map((target) => target.trim())
      .filter((target) => target.length > 0);
  }

  return [/localhost/, /127\.0\.0\.1/, /instantdb\.com/];
}

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: SENTRY_DSN,
  environment: APP_ENV,
  release: SENTRY_RELEASE,
  dist: SENTRY_DIST,

  // Disable Sentry when DSN is not configured (e.g. local dev / forks).
  enabled: Boolean(SENTRY_DSN),

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  // Privacy-first default: only enable if we have a clear, user-facing opt-in.
  sendDefaultPii: false,

  // Enable Logs
  enableLogs: true,

  // Enable tracing and profiling.
  tracesSampleRate: __DEV__ ? 1.0 : 0.15,
  profilesSampleRate: __DEV__ ? 1.0 : 0.2,
  enableUserInteractionTracing: true,
  enableCaptureFailedRequests: true,
  enableNativeFramesTracking: !isRunningInExpoGo(),
  tracePropagationTargets: getTracePropagationTargets(),

  // Configure Session Replay
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    navigationIntegration,
    Sentry.mobileReplayIntegration({
      beforeErrorSampling: (event) => {
        const hasHandledException = event.exception?.values?.some(
          (exception) => exception.mechanism?.handled === true
        );

        return !hasHandledException;
      },
    }),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    hasConfirmedAge,
    isReady,
    profile,
  } = useAuth();

  const segments = useSegments();
  const hasRecordedReadyMetric = useRef(false);

  const inAuthScreen =
    segments[0] === 'welcome' ||
    segments[0] === 'onboarding' ||
    segments[0] === 'age-gate';

  let redirectHref: string | null = null;

  if (!hasConfirmedAge) {
    if (segments[0] !== 'age-gate') {
      redirectHref = '/age-gate';
    }
  } else if (!isAuthenticated) {
    if (segments[0] !== 'welcome') {
      redirectHref = '/welcome';
    }
  } else if (!hasCompletedOnboarding) {
    if (segments[0] !== 'onboarding') {
      redirectHref = '/onboarding';
    }
  } else if (inAuthScreen) {
    redirectHref = '/(tabs)/(garden)';
  }

  useEffect(() => {
    if (!isReady) return;

    if (!redirectHref) {
      // Hide splash screen only when no redirect is pending to prevent flashing
      SplashScreen.hideAsync().catch(() => {});
    }

    if (hasRecordedReadyMetric.current) return;

    hasRecordedReadyMetric.current = true;
    recordStartupUxMetric({
      milestone: 'auth-gate-ready',
      durationMs: Date.now() - appBootStartedAt,
    });
  }, [isReady, redirectHref]);

  useEffect(() => {
    if (!isAuthenticated || !profile) {
      Sentry.setUser(null);
      return;
    }

    // Privacy-first: only set anonymized user ID for error tracking.
    // Username is PII and should not be sent unless user explicitly opts in.
    Sentry.setUser({
      id: profile.id,
    });
  }, [isAuthenticated, profile]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-bg">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (redirectHref) {
    return <Redirect href={redirectHref as never} />;
  }

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation('common');
  const formSheetPresets = getFormSheetPresets(colorScheme === 'dark');

  return (
    <>
      <AuthGate />

      <Stack screenOptions={{ headerBackTitle: t('back') }}>
        <Stack.Screen
          name="age-gate"
          options={{ headerShown: false, animation: 'none' }}
        />

        <Stack.Screen
          name="welcome"
          options={{ headerShown: false, animation: 'none' }}
        />

        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, animation: 'none' }}
        />

        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="profile" options={{ presentation: 'modal' }} />

        <Stack.Screen
          name="plants/add"
          options={formSheetPresets.wizardSheet}
        />

        <Stack.Screen
          name="plants/add-success"
          options={formSheetPresets.successSheet}
        />

        <Stack.Screen
          name="harvests/create"
          options={formSheetPresets.editorSheet}
        />

        <Stack.Screen
          name="harvests/success"
          options={formSheetPresets.successSheet}
        />

        <Stack.Screen name="ai-diagnosis" options={{ headerShown: false }} />

        <Stack.Screen name="+not-found" options={{ title: t('notFound') }} />
      </Stack>
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  const navigationRef = useNavigationContainerRef();
  const colorScheme = useColorScheme();
  const navigationTheme =
    colorScheme === 'dark' ? NAV_DARK_THEME : NAV_LIGHT_THEME;

  useEffect(() => {
    if (navigationRef)
      navigationIntegration.registerNavigationContainer(navigationRef);
  }, [navigationRef]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            Sentry.withScope((scope) => {
              scope.setTag('query.hash', query.queryHash);
              scope.setContext('reactQuery', {
                source: 'query',
                queryHash: query.queryHash,
              });

              Sentry.captureException(error);
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, ...args) => {
            const mutation = args[2];

            Sentry.withScope((scope) => {
              scope.setContext('reactQuery', {
                source: 'mutation',
                mutationKey: mutation.options.mutationKey,
              });

              Sentry.captureException(error);
            });
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        <GestureHandlerRootView className="flex-1 bg-background dark:bg-dark-bg">
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
});
