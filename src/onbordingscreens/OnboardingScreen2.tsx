import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import adjust from '../utils/Adjust';

const { width } = Dimensions.get('window');

type Props = {
  onNext: () => void;
  onSkip: () => void;
};

const OnboardingScreen2: React.FC<Props> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  // Slider State (Start in the middle)
  const translateX = useSharedValue(width / 2);
  const context = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateX.value;
    })
    .onUpdate((event) => {
      // Clamp values between 0 and width
      let newValue = context.value + event.translationX;
      if (newValue < 0) newValue = 0;
      if (newValue > width) newValue = width;
      translateX.value = newValue;
    });

  const foregroundStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    };
  });

  const handleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* --- Comparison Slider Section --- */}
        <View style={styles.sliderContainer}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.sliderContent}>
              {/* Background Image (Before - Chair) - Visible on the Right */}
              <Image
                source={require('../assets/images/secondonbording1.jpg')}
                style={styles.imageFull}
                resizeMode="cover"
              />

              {/* Foreground Image (After - Empty) - Visible on the Left (Masked) */}
              <Animated.View style={[styles.foregroundWrapper, foregroundStyle]}>
                <Image
                  source={require('../assets/images/secondonbording2.png')}
                  style={styles.imageFull}
                  resizeMode="cover"
                />
              </Animated.View>

              {/* Labels Overlay */}
              <View style={styles.labelsContainer} pointerEvents="none">
                <Text style={styles.labelAfter}>After</Text>
                <Text style={styles.labelBefore}>Before</Text>
              </View>

              {/* Slider Handle */}
              <Animated.View style={[styles.sliderHandleContainer, handleStyle]}>
                <View style={styles.sliderHandle}>
                  <View style={styles.sliderHandleDot} />
                </View>
                {/* Vertical Line Visual */}
                <View style={styles.sliderLine} />
              </Animated.View>
            </View>
          </GestureDetector>
        </View>

        {/* --- Bottom Content Section --- */}
        <View style={styles.bottomContent}>
          {/* Title & Next Button Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>Replace or Remove</Text>
              <Text style={styles.titleText}>Your Furniture</Text>
              <Text style={styles.titleText}>With AI</Text>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={onNext}
              activeOpacity={0.8}
            >
              <FontAwesome name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Footer Controls (Skip, Dots) */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View style={styles.paginationContainer}>
              <View style={styles.dot} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
            </View>

            {/* Spacer to balance layout */}
            <View style={styles.skipBtn} />
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sliderContainer: {
    flex: 0.75, // Takes up ~75% of screen
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: adjust(30),
    borderBottomRightRadius: adjust(30),
  },
  sliderContent: {
    flex: 1,
    position: 'relative',
  },
  imageFull: {
    width: width,
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  foregroundWrapper: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRightWidth: 0,
  },
  labelsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: adjust(40),
    paddingTop: adjust(40),
    zIndex: 5,
  },
  labelBefore: {
    fontSize: adjust(24),
    fontWeight: '800', // Extra bold
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: adjust(1) },
    textShadowRadius: adjust(2),
  },
  labelAfter: {
    fontSize: adjust(24),
    fontWeight: '800', // Extra bold
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: adjust(1) },
    textShadowRadius: adjust(2),
  },
  sliderHandleContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    width: 0,
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  sliderHandle: {
    width: adjust(40),
    height: adjust(40),
    borderRadius: adjust(20),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
  sliderHandleDot: {
    width: adjust(6),
    height: adjust(6),
    borderRadius: adjust(3),
    backgroundColor: '#D1D5DB', // Light gray dot inside
  },

  bottomContent: {
    flex: 0.25,
    paddingHorizontal: adjust(24),
    paddingTop: adjust(24),
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: adjust(10),
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: adjust(28), // Large bold text
    fontWeight: '800',
    color: '#000000',
    lineHeight: adjust(34),
  },
  nextButton: {
    width: adjust(56),
    height: adjust(56),
    borderRadius: adjust(28),
    backgroundColor: '#7C3AED', // Purple
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: adjust(16),
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: adjust(10),
  },
  skipBtn: {
    width: adjust(60), // Fixed width for alignment
    paddingVertical: adjust(10),
  },
  skipText: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#000000',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: adjust(8),
  },
  dot: {
    width: adjust(8),
    height: adjust(8),
    borderRadius: adjust(4),
    backgroundColor: '#E5E7EB', // Gray
  },
  dotActive: {
    width: adjust(8),
    backgroundColor: '#7C3AED', // Purple
  },
});

export default OnboardingScreen2;
