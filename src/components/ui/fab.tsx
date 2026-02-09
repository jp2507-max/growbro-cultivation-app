import { Plus } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import Colors from '@/constants/colors';
import { motion } from '@/src/lib/animations/motion';

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

  const handlePressIn = useCallback(() => {
    scale.set(withSpring(0.9, motion.spring.snappy));
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.set(withSpring(1, motion.spring.bouncy));
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = colorScheme === 'dark' ? Colors.darkBg : Colors.white;

  const bgColor =
    colorScheme === 'dark' ? Colors.primaryBright : Colors.primary;

  return (
    <Animated.View
      style={[styles.fab, { bottom, backgroundColor: bgColor }, animatedStyle]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={testID}
        style={styles.fabPressable}
      >
        {icon ?? <Plus size={24} color={iconColor} />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px 0px rgba(46,125,50,0.3)',
  },
  fabPressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
