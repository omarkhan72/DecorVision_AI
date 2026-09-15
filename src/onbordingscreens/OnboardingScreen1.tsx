import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AutoBeforeAfterSlider from '../components/AutoBeforeAfterSlider';
import adjust from '../utils/Adjust';
import { useFirebaseImagePaths } from '../hooks/useFirebaseImagePaths';

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
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          )}
        </View>

        {/* --- Bottom Content Section --- */}
        <View style={styles.bottomContent}>
          {/* Title & Next Button Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>AI Interior Design</Text>
              <Text style={styles.titleText}>& Remodeling</Text>
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
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Spacer to balance layout */}
            <View style={styles.skipBtn} />
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
    flex: 0.75, // Takes up ~75% of screen
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: adjust(30),
    borderBottomRightRadius: adjust(30),
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
    fontSize: adjust(28),
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
    width: adjust(60),
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

export default OnboardingScreen1;
