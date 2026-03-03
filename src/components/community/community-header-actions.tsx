import { Bookmark } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Colors from '@/constants/colors';
import { HeaderAction } from '@/src/components/ui/header-action';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { View } from '@/src/tw';

type CommunityHeaderActionsProps = {
  onOpenSaved: () => void;
};

export function CommunityHeaderActions({
  onOpenSaved,
}: CommunityHeaderActionsProps): React.ReactElement {
  const { t } = useTranslation('community');

  return (
    <View className="flex-row items-center">
      <HeaderAction
        accessibilityLabel={t('actions.viewSaved')}
        accessibilityHint={t('actions.viewSaved')}
        onPress={onOpenSaved}
        variant="icon"
        className="size-9 rounded-full"
        testID="saved-posts-btn"
      >
        <PlatformIcon
          sfName="bookmark"
          fallbackIcon={Bookmark}
          size={18}
          color={Colors.primary}
        />
      </HeaderAction>
    </View>
  );
}
