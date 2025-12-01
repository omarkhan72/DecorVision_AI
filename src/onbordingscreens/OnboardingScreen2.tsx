import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const onboardingImage2 = require('../assets/images/onbordingscreen2.png');

type Props = {
  onNext: () => void;
  onSkip: () => void;
};

const OnboardingScreen2: React.FC<Props> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.cardWrapper}>
        <View style={styles.cardShadow}>
          <Image
            source={onboardingImage2 as ImageSourcePropType}
            style={styles.beforeAfterImage}
            resizeMode="cover"
          />
          <View style={styles.cardImageOverlay} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardHeadlineText}>
              A bright, open,{'\n'}contemporary{'\n'}space.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.paragraphText}>
          <Text style={styles.boldText}>Compare before </Text>
          <Text>and </Text>
          <Text style={styles.boldText}>after </Text>
          <Text>with a smooth slider that shows the </Text>
          <Text style={styles.boldText}>difference</Text>
          <Text> clearly.</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.skipButton, { bottom: insets.bottom + 24 }]}
        onPress={onSkip}
        activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryCircleButton, { bottom: insets.bottom + 24 }]}
        onPress={onNext}
        activeOpacity={0.85}>
        <FontAwesome name="arrow-right" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cardWrapper: {
    marginTop: 32,
    paddingHorizontal: 20, // side margin like the design
    alignItems: 'center',
  },
  cardShadow: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  beforeAfterImage: {
    width: '100%',
    // Slightly taller card like your design
    aspectRatio: 4 / 3,
    borderRadius: 32,
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  cardTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    padding: 24,
  },
  cardHeadlineText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
  },
  textBlock: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  paragraphText: {
    fontSize: 22,
    lineHeight: 32,
    color: '#111111',
  },
  boldText: {
    fontWeight: '800',
  },
  skipButton: {
    position: 'absolute',
    left: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#111111',
  },
  primaryCircleButton: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default OnboardingScreen2;


