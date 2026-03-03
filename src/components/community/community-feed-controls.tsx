import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { ArrowDownUp } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import {
  COMMUNITY_TYPE_FILTER_KEYS,
  type CommunitySortKey,
  type CommunityTypeFilterKey,
} from '@/src/hooks/use-community-feed-filter';
import { Pressable, Text, View } from '@/src/tw';

type CommunityFeedControlsProps = {
  activeType: CommunityTypeFilterKey;
  activeSort: CommunitySortKey;
  typeFilterLabels: string[];
  isDark: boolean;
  onChangeType: (type: CommunityTypeFilterKey) => void;
  onToggleSort: () => void;
};

export function CommunityFeedControls({
  activeType,
  activeSort,
  typeFilterLabels,
  isDark,
  onChangeType,
  onToggleSort,
}: CommunityFeedControlsProps): React.ReactElement {
  const { t } = useTranslation('community');

  return (
    <View className="mt-3.5 flex-row items-center gap-2 px-5 pb-2">
      <View className="flex-1">
        <SegmentedControl
          values={typeFilterLabels}
          selectedIndex={Math.max(
            0,
            COMMUNITY_TYPE_FILTER_KEYS.indexOf(activeType)
          )}
          onChange={({ nativeEvent }) => {
            const index = nativeEvent.selectedSegmentIndex;
            const safeIndex = Number.isInteger(index)
              ? Math.min(
                  Math.max(0, index),
                  COMMUNITY_TYPE_FILTER_KEYS.length - 1
                )
              : 0;

            onChangeType(COMMUNITY_TYPE_FILTER_KEYS[safeIndex]);
          }}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('sort.label')}
        accessibilityHint={t('sort.label')}
        className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-2 dark:border-dark-border"
        onPress={onToggleSort}
        testID="sort-toggle"
      >
        <ArrowDownUp
          size={14}
          color={isDark ? Colors.textSecondaryDark : Colors.textSecondary}
        />
        <Text className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark">
          {t(`sort.${activeSort}`)}
        </Text>
      </Pressable>
    </View>
  );
}
