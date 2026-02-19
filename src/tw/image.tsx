import { Image as RNImage } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

type ExpoImageProps = React.ComponentProps<typeof AnimatedExpoImage>;

function BaseImage(props: ExpoImageProps) {
  // @ts-expect-error: Uniwind may inject objectFit/objectPosition into style while expo-image expects contentFit/contentPosition props.
  const { objectFit, objectPosition, ...style } =
    StyleSheet.flatten(props.style) || {};

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...props}
      source={
        typeof props.source === 'string' ? { uri: props.source } : props.source
      }
      // @ts-expect-error: The extracted style object type doesn't perfectly match expo-image's strict style prop type, but works at runtime.
      style={style}
    />
  );
}

const StyledImage = withUniwind(BaseImage);

export type ImageProps = React.ComponentProps<typeof StyledImage>;

export const Image = StyledImage;
