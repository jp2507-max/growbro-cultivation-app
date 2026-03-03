import { MessageCircle } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FadeInUp } from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { motion, withRM } from '@/src/lib/animations/motion';
import { Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type CommunityFeedEmptyProps = {
  searchQuery: string;
  onCreateFirstPost: () => void;
};

export function CommunityFeedEmpty({
  searchQuery,
  onCreateFirstPost,
}: CommunityFeedEmptyProps): React.ReactElement {
  const { t } = useTranslation('community');

  const { title, subtitle, hasSearch } = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;

    const nextTitle = hasSearch ? t('noSearchResultsTitle') : t('noPostsTitle');
    const nextSubtitle = hasSearch
      ? t('noSearchResultsSubtitle', { query: searchQuery.trim() })
      : t('noPostsSubtitle');

    return {
      title: nextTitle,
      subtitle: nextSubtitle,
      hasSearch,
    };
  }, [searchQuery, t]);

  return (
    <Animated.View
      className="items-center px-8 py-16"
      entering={withRM(FadeInUp.duration(motion.dur.lg))}
    >
      <View className="mb-5 size-24 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15">
        <View className="size-18 items-center justify-center rounded-full border-2 border-primary/35 bg-card dark:border-primary-bright/40 dark:bg-dark-bg-card">
          <PlatformIcon
            sfName="message"
            fallbackIcon={MessageCircle}
            size={32}
            color={Colors.primary}
          />
        </View>
      </View>
      <Text className="text-lg font-extrabold text-text dark:text-text-primary-dark">
        {title}
      </Text>
      <Text className="mt-2 text-center text-[15px] text-text-secondary dark:text-text-secondary-dark">
        {subtitle}
      </Text>

      {!hasSearch ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('createFirstPost')}
          accessibilityHint={t('preview.openComposer')}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 dark:bg-primary-bright"
          onPress={onCreateFirstPost}
          testID="create-first-post-btn"
        >
          <Text className="text-sm font-bold text-white dark:text-on-primary-dark">
            {t('createFirstPost')}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
