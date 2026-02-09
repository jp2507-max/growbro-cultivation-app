import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, useSegments } from 'expo-router';
import Stack from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator } from 'react-native';

import Colors from '@/constants/colors';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { GestureHandlerRootView, View } from '@/src/tw';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function useProtectedRoute(): React.ReactNode {
  const { isAuthenticated, hasCompletedOnboarding, hasConfirmedAge, isReady } =
    useAuth();
  const segments = useSegments();
  const splashHidden = useRef(false);

  useEffect(() => {
    if (!isReady) return;
    if (!splashHidden.current) {
      SplashScreen.hideAsync();
      splashHidden.current = true;
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View className="bg-background dark:bg-dark-bg flex-1 items-center justify-center">
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
  } else if (inAuthScreen) {
    return <Redirect href="/(tabs)/(garden)" />;
  }

  return null;
}

function RootLayoutNav() {
  const authRedirect = useProtectedRoute();

  return (
    <>
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
      {authRedirect}
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView className="bg-background dark:bg-dark-bg flex-1">
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
