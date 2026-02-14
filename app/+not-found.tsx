import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/src/lib/routes';
import { Link, ScrollView, Text } from '@/src/tw';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: t('notFound') }} />
      <ScrollView
        className="bg-background dark:bg-dark-bg flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-text dark:text-text-primary-dark text-center text-xl font-bold">
          {t('pageNotFound')}
        </Text>
        <Link
          href={ROUTES.GARDEN}
          className="bg-primary dark:bg-primary-bright mt-4 self-center rounded-xl px-6 py-3"
        >
          <Text className="dark:text-dark-bg text-[15px] font-semibold text-white">
            {t('goToGarden')}
          </Text>
        </Link>
      </ScrollView>
    </>
  );
}
