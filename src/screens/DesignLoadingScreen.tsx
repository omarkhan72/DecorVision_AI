import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useFirebaseImagePaths } from '../hooks/useFirebaseImagePaths';

const IMAGES = ['interior-design.webp'];

type Props = {
  onComplete?: () => void;
  userImage?: string | null;
};

const DesignLoadingScreen = ({ onComplete, userImage }: Props) => {
  const insets = useSafeAreaInsets();
  const [topSectionHeight, setTopSectionHeight] = useState(0);
  const { images } = useFirebaseImagePaths(IMAGES);

  // Use the user's uploaded image or fallback to default
  const backgroundImage = userImage 
    ? { uri: userImage }
    : images['interior-design.webp'] || { uri: '' };

  // Animation value for scanning line (0 to topSectionHeight)
  const scanLinePosition = useSharedValue(0);

  // Get actual height of top section
  const handleTopSectionLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setTopSectionHeight(height);
  };

  // Auto-navigate after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3500); // 3.5 seconds

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Start scanning animation when height is available
  useEffect(() => {
    if (topSectionHeight > 0) {
      scanLinePosition.value = 0; // Start at top
      // Stop just before the bottom to avoid going into separator
      const targetPosition = topSectionHeight - 4;
      scanLinePosition.value = withRepeat(
        withTiming(targetPosition, {
          duration: 2000, // 2 seconds to scan from top to bottom
          easing: Easing.linear,
        }),
        -1, // Infinite repeat
        true // Reverse: go up to down, then down to up
      );
    }
  }, [topSectionHeight]);

  // Animated style for scanning line
  const scanLineStyle = useAnimatedStyle(() => {
    return {
      top: scanLinePosition.value,
    };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Section - Blurred Interior Image (60% of screen) */}
      <View style={styles.topSection} onLayout={handleTopSectionLayout}>
        <Image
          source={backgroundImage}
          style={styles.blurredImage}
          blurRadius={5}
          resizeMode="cover"
        />
        <View style={styles.blurOverlay} />
        {/* Scanning Line - Rendered last so it's on top */}
        {topSectionHeight > 0 && (
          <Animated.View style={[styles.scanLine, scanLineStyle]}>
            <View style={styles.scanLineGlow} />
            <View style={styles.scanLineInner} />
          </Animated.View>
        )}
      </View>

      {/* Separator Line */}
      <View style={styles.separatorLine} />

      {/* Bottom Section - White Background (40% of screen) */}
      <View style={styles.bottomSection}>
        <Text style={styles.generatingText}>Generating Design ...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 0.6, // 60% of screen
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  blurredImage: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    height: 4,
    zIndex: 20, // Above blurOverlay (which has no zIndex)
    elevation: 10, // For Android
  },
  scanLineInner: {
    width: '100%',
    height: 4,
    backgroundColor: '#8B5CF6',
    opacity: 1,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scanLineGlow: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#8B5CF6',
    opacity: 0.4,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  separatorLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  bottomSection: {
    flex: 0.4, // 40% of screen
    width: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
});

export default DesignLoadingScreen;

