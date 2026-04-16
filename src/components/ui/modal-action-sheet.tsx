import React, { useMemo } from 'react';
import { Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable, Text, View } from '@/src/tw';

export interface ActionSheetOption {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface ModalActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
}

export function ModalActionSheet({
  visible,
  onClose,
  title,
  options,
}: ModalActionSheetProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  const cancelOptions = useMemo(
    () => options.filter((o) => o.style === 'cancel'),
    [options]
  );

  const mainOptions = useMemo(
    () => options.filter((o) => o.style !== 'cancel'),
    [options]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          accessibilityHint="Closes the action sheet"
        />

        <View
          className="px-4 pb-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-2 overflow-hidden rounded-[14px] bg-white dark:bg-dark-bg-elevated">
            {title ? (
              <View className="border-b border-border/50 bg-white/90 p-3 dark:border-dark-border/50 dark:bg-dark-bg-elevated/90">
                <Text className="text-center text-[13px] font-semibold text-text-secondary dark:text-text-secondary-dark">
                  {title}
                </Text>
              </View>
            ) : null}

            {mainOptions.map((option, index) => {
              const isLast = index === mainOptions.length - 1;
              const isDestructive = option.style === 'destructive';

              return (
                <Pressable
                  key={`${option.text}-${index}`}
                  accessibilityRole="button"
                  onPress={() => {
                    onClose();
                    if (option.onPress) {
                      setTimeout(option.onPress, 50);
                    }
                  }}
                  className={`
                    flex-row items-center justify-center p-4 active:bg-black/5 dark:active:bg-white/5
                    ${!isLast ? 'border-b border-border/50 dark:border-dark-border/50' : ''}
                  `}
                >
                  <Text
                    className={`
                      text-lg
                      ${isDestructive ? 'text-danger dark:text-error-dark' : 'text-primary dark:text-primary-bright'}
                    `}
                  >
                    {option.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {cancelOptions.map((option, index) => (
            <View
              key={`cancel-${index}`}
              className="mb-2 overflow-hidden rounded-[14px] bg-white dark:bg-dark-bg-elevated"
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  if (option.onPress) {
                    setTimeout(option.onPress, 50);
                  }
                }}
                className="flex-row items-center justify-center p-4 active:bg-black/5 dark:active:bg-white/5"
              >
                <Text className="text-lg font-semibold text-primary dark:text-primary-bright">
                  {option.text}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
}
