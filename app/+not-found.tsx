import { Link, Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-background p-5 dark:bg-dark-bg">
        <Text className="text-xl font-bold text-text dark:text-text-primary-dark">
          Page not found
        </Text>
        <Link
          href="/"
          className="mt-4 rounded-xl bg-primary px-6 py-3 dark:bg-primary-bright"
        >
          <Text className="text-[15px] font-semibold text-white dark:text-dark-bg">
            Go to Garden
          </Text>
        </Link>
      </View>
    </>
  );
}
