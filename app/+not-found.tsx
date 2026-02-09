import { Stack } from 'expo-router';
import React from 'react';

import { Link, Text, View } from '@/src/tw';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="bg-background dark:bg-dark-bg flex-1 items-center justify-center p-5">
        <Text className="text-text dark:text-text-primary-dark text-xl font-bold">
          Page not found
        </Text>
        <Link
          href="/"
          className="bg-primary dark:bg-primary-bright mt-4 rounded-xl px-6 py-3"
        >
          <Text className="dark:text-dark-bg text-[15px] font-semibold text-white">
            Go to Garden
          </Text>
        </Link>
      </View>
    </>
  );
}
