import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, View } from "react-native";

import Colors from "@/constants/colors";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate() {
  const { isAuthenticated, hasCompletedOnboarding, hasConfirmedAge, isReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const inAuthScreen = segments[0] === 'welcome' || segments[0] === 'onboarding' || segments[0] === 'age-gate';

    if (!hasConfirmedAge) {
      if (segments[0] !== 'age-gate') {
        router.replace('/age-gate');
      }
    } else if (!isAuthenticated) {
      if (segments[0] !== 'welcome') {
        router.replace('/welcome');
      }
    } else if (!hasCompletedOnboarding) {
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
    } else {
      if (inAuthScreen) {
        router.replace('/(tabs)/(garden)' as never);
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, hasConfirmedAge, isReady, segments, router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthGate />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="age-gate" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="add-plant" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="task-detail" options={{ headerShown: false }} />
        <Stack.Screen name="strain-detail" options={{ headerShown: false }} />
        <Stack.Screen name="harvest" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="ai-diagnosis" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
