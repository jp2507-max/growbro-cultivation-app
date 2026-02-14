import { Plus } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { PlatformIcon } from '@/src/components/ui/platform-icon';
import { motion } from '@/src/lib/animations/motion';
import { Pressable } from '@/src/tw';
import { Animated } from '@/src/tw/animated';

type FabProps = {
  onPress?: () => void;
  testID?: string;
  icon?: React.ReactNode;
  bottom?: number;
};

export function AnimatedFab({ onPress, testID, icon, bottom = 24 }: FabProps) {
  const scale = useSharedValue(0);
  const colorScheme = useColorScheme();

  useEffect(() => {
    scale.set(withSpring(1, motion.spring.bouncy));
    return () => cancelAnimation(scale);
  }, [scale]);

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .onBegin(() => {
          scale.set(withSpring(0.9, motion.spring.snappy));
        })
        .onFinalize(() => {
          scale.set(withSpring(1, motion.spring.bouncy));
        }),
    [scale]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const iconColor = colorScheme === 'dark' ? Colors.darkBg : Colors.white;

  const bgColor =
    colorScheme === 'dark' ? Colors.primaryBright : Colors.primary;

  return (
    <Animated.View
      className="absolute right-5 size-14 items-center justify-center rounded-full shadow-lg"
      style={[{ bottom, backgroundColor: bgColor }, animatedStyle]}
    >
      <GestureDetector gesture={tapGesture}>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          testID={testID}
          className="size-full items-center justify-center"
        >
          {icon ?? (
            <PlatformIcon
              sfName="plus"
              fallbackIcon={Plus}
              size={24}
              color={iconColor}
            />
          )}
        </Pressable>
      </GestureDetector>
    </Animated.View>
  );
}
