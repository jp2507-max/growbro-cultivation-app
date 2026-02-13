import '../global.css';
import '@/src/lib/i18n';

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
import { ActivityIndicator } from 'react-native';

import Colors from '@/constants/colors';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { recordStartupUxMetric } from '@/src/lib/observability/sentry-metrics';
import { GestureHandlerRootView, View } from '@/src/tw';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const SENTRY_RELEASE = process.env.EXPO_PUBLIC_SENTRY_RELEASE;
const SENTRY_DIST = process.env.EXPO_PUBLIC_SENTRY_DIST;
const traceTargetList = process.env.EXPO_PUBLIC_SENTRY_TRACE_TARGETS;
const APP_ENV =
  process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? 'development' : 'production');
const appBootStartedAt = Date.now();

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
    userName,
  } = useAuth();

  const segments = useSegments();
  const hasRecordedReadyMetric = useRef(false);

  useEffect(() => {
    if (!isReady) return;

    // Hide splash screen once auth state is determined
    SplashScreen.hideAsync().catch(() => {});

    if (hasRecordedReadyMetric.current) return;

    hasRecordedReadyMetric.current = true;
    recordStartupUxMetric({
      milestone: 'auth-gate-ready',
      durationMs: Date.now() - appBootStartedAt,
    });
  }, [isReady]);

  useEffect(() => {
    if (!isAuthenticated || !profile) {
      Sentry.setUser(null);
      return;
    }

    Sentry.setUser({
      id: profile.id,
      username: userName || undefined,
    });
  }, [isAuthenticated, profile, userName]);

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-dark-bg">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const inAuthScreen =
    segments[0] === 'welcome' ||
    segments[0] === 'onboarding' ||
    segments[0] === 'age-gate';

  if (!hasConfirmedAge) {
    if (segments[0] !== 'age-gate') {
      return <Redirect href="/age-gate" />;
    }
  } else if (!isAuthenticated) {
    if (segments[0] !== 'welcome') {
      return <Redirect href="/welcome" />;
    }
  } else if (!hasCompletedOnboarding) {
    if (segments[0] !== 'onboarding') {
      return <Redirect href="/onboarding" />;
    }
  } else {
    if (inAuthScreen) {
      return <Redirect href="/(tabs)/(garden)" />;
    }
  }

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthGate />

      <Stack screenOptions={{ headerBackTitle: 'Back' }}>
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

        <Stack.Screen
          name="profile"
          options={{ presentation: 'modal', headerShown: false }}
        />

        <Stack.Screen
          name="add-plant"
          options={{
            presentation: 'formSheet',

            sheetGrabberVisible: true,

            sheetAllowedDetents: [0.85, 1.0],

            headerShown: false,
          }}
        />

        <Stack.Screen name="task-detail" options={{ headerShown: false }} />

        <Stack.Screen name="strain-detail" options={{ headerShown: false }} />

        <Stack.Screen
          name="strain-filters"
          options={{
            presentation: 'formSheet',
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.65, 0.9],
          }}
        />

        <Stack.Screen
          name="harvest"
          options={{
            presentation: 'formSheet',

            sheetGrabberVisible: true,

            sheetAllowedDetents: [0.75, 1.0],

            headerShown: false,
          }}
        />

        <Stack.Screen name="ai-diagnosis" options={{ headerShown: false }} />

        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  const navigationRef = useNavigationContainerRef();

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
      <GestureHandlerRootView className="flex-1 bg-background dark:bg-dark-bg">
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
});
