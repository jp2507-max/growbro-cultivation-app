import { Image as RNImage } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useCssElement } from 'react-native-css';
import Animated from 'react-native-reanimated';

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

export type ImageProps = React.ComponentProps<typeof AnimatedExpoImage> & {
  className?: string;
};

function CSSImage(props: React.ComponentProps<typeof AnimatedExpoImage>) {
  // @ts-expect-error: NativeWind injects objectFit into style, but expo-image uses contentFit. We extract it here.
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

export const Image = (props: ImageProps) => {
  // @ts-expect-error: TypeScript can fail to infer types due to excessive depth when combining expo-image types with useCssElement.
  return useCssElement(CSSImage, props, { className: 'style' });
};

Image.displayName = 'CSS(Image)';
