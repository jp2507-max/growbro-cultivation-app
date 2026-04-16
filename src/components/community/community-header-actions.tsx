import { Bookmark } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

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
  const colorScheme = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? Colors.primaryBright : Colors.primary;

  return (
    <View className="flex-row items-center">
      <HeaderAction
        accessibilityLabel={t('actions.viewSaved')}
        accessibilityHint={t('actions.viewSavedHint')}
        onPress={onOpenSaved}
        variant="icon"
        className="relative size-10.5"
        testID="saved-posts-btn"
      >
        <PlatformIcon
          sfName="bookmark"
          fallbackIcon={Bookmark}
          size={19}
          color={iconColor}
        />
      </HeaderAction>
    </View>
  );
}
