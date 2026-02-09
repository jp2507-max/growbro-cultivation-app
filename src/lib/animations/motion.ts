import {
  Easing,
  ReduceMotion,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

export const motion = {
  dur: { xs: 120, sm: 180, md: 260, lg: 360, xl: 600 },
  ease: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    emphasized: Easing.bezier(0.2, 0, 0, 1),
    decel: Easing.bezier(0, 0, 0.2, 1),
  },
  spring: {
    /** Gentle spring — low bounce, good for subtle scale/opacity changes */
    gentle: {
      damping: 15,
      stiffness: 120,
      reduceMotion: ReduceMotion.System,
    } satisfies WithSpringConfig,
    /** Bouncy spring — snappy micro-interactions (tap feedback, FAB press) */
    bouncy: {
      damping: 12,
      stiffness: 180,
      reduceMotion: ReduceMotion.System,
    } satisfies WithSpringConfig,
    /** Stiff spring — quick response, minimal overshoot (day pill, toggles) */
    stiff: {
      damping: 15,
      stiffness: 200,
      reduceMotion: ReduceMotion.System,
    } satisfies WithSpringConfig,
    /** Snappy spring — fast press-in feedback */
    snappy: {
      damping: 15,
      stiffness: 300,
      reduceMotion: ReduceMotion.System,
    } satisfies WithSpringConfig,
  },
};

/** Shorthand for a ReduceMotion-aware timing config */
export function rmTiming(duration: number): WithTimingConfig {
  return { duration, reduceMotion: ReduceMotion.System };
}

export const withRM = <T extends { reduceMotion?: (rm: ReduceMotion) => T }>(
  anim: T
): T => anim.reduceMotion?.(ReduceMotion.System) ?? anim;
