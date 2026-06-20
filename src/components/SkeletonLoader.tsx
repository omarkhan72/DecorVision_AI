import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type SkeletonProps = {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: ViewStyle;
};

/**
 * A single skeleton shimmer element.
 * Pulses opacity between 0.3 and 1.0 for a smooth loading effect.
 */
const SkeletonItem: React.FC<SkeletonProps> = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        skeletonStyles.base,
        { width: width as any, height: height as any, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
};

/**
 * Skeleton grid for upload screens (2x2 grid of square image placeholders).
 */
export const UploadScreenSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <View style={skeletonStyles.gridRow}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={skeletonStyles.gridItem}>
          <SkeletonItem width="100%" height="100%" borderRadius={12} />
        </View>
      ))}
    </View>
  );
};

/**
 * Skeleton grid for style selection screens (3-column grid of circular image placeholders with text).
 */
export const StyleSelectionSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <View style={skeletonStyles.stylesGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={skeletonStyles.styleCard}>
          <SkeletonItem width={90} height={90} borderRadius={45} />
          <View style={skeletonStyles.styleTextSpacer}>
            <SkeletonItem width={60} height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  base: {
    backgroundColor: '#E5E7EB',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleCard: {
    width: '30%',
    marginBottom: 24,
    alignItems: 'center',
  },
  styleTextSpacer: {
    marginTop: 8,
  },
});

export default SkeletonItem;
