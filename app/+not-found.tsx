import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Link, Text, View } from '@/src/tw';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('notFound') }} />
      <View className="bg-background dark:bg-dark-bg flex-1 items-center justify-center p-5">
        <Text className="text-text dark:text-text-primary-dark text-xl font-bold">
          {t('pageNotFound')}
        </Text>
        <Link
          href="/"
          className="bg-primary dark:bg-primary-bright mt-4 rounded-xl px-6 py-3"
        >
          <Text className="dark:text-dark-bg text-[15px] font-semibold text-white">
            {t('goToGarden')}
          </Text>
        </Link>
      </View>
    </>
  );
}
