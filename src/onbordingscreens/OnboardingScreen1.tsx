import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AutoBeforeAfterSlider from '../components/AutoBeforeAfterSlider';
import adjust from '../utils/Adjust';
import { useFirebaseImagePaths } from '../hooks/useFirebaseImagePaths';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_GAP = adjust(16);
const SLIDER_WIDTH = SCREEN_WIDTH - HORIZONTAL_GAP * 2;

const IMAGES = ['firstonbording.webp', 'firstonbording2.webp'];

type Props = {
  onNext: () => void;
  onSkip: () => void;
};

const OnboardingScreen1: React.FC<Props> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();
  const { images } = useFirebaseImagePaths(IMAGES);

  return (
    <View style={styles.container}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* --- Comparison Slider Section --- */}
        <View style={styles.sliderContainer}>
          {images['firstonbording.webp'] && images['firstonbording2.webp'] ? (
            <AutoBeforeAfterSlider
              beforeImage={images['firstonbording.webp']}
              afterImage={images['firstonbording2.webp']}
              sliderWidth={SLIDER_WIDTH}
              containerStyle={styles.sliderBox}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          )}
        </View>

        {/* --- Bottom Content Section --- */}
        <View style={styles.bottomContent}>
          {/* Centered Title */}
          <Text style={styles.centerTitleText} numberOfLines={1} adjustsFontSizeToFit>AI Interior Design</Text>

          {/* Footer Controls (Skip, Dots, Next) */}
          <View style={styles.footerRow}>
            {/* Skip Button */}
            <TouchableOpacity onPress={onSkip} style={styles.skipBtn} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Center Pagination Dots */}
            <View style={styles.paginationContainer}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Next Button */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={onNext}
              activeOpacity={0.85}
            >
              <FontAwesome name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sliderContainer: {
    flex: 0.80,
    width: '100%',
    paddingHorizontal: HORIZONTAL_GAP,
    position: 'relative',
  },
  sliderBox: {
    flex: 1,
    borderRadius: adjust(24),
    overflow: 'hidden',
  },
  bottomContent: {
    flex: 0.20,
    paddingHorizontal: adjust(24),
    paddingTop: adjust(12),
    paddingBottom: adjust(12),
    justifyContent: 'space-between',
  },
  centerTitleText: {
    fontSize: adjust(25),
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginTop: adjust(6),
    marginBottom: adjust(4),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    width: adjust(60),
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  skipText: {
    fontSize: adjust(16),
    fontWeight: '600',
    color: '#6B7280',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: adjust(6),
  },
  dot: {
    width: adjust(6),
    height: adjust(6),
    borderRadius: adjust(3),
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    width: adjust(22),
    height: adjust(6),
    borderRadius: adjust(3),
    backgroundColor: '#7C3AED',
  },
  nextButton: {
    width: adjust(54),
    height: adjust(54),
    borderRadius: adjust(27),
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default OnboardingScreen1;
