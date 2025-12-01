import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

type Props = {
  onComplete: () => void;
  onSkip: () => void;
};

type ScreenProps = {
  onNext: () => void;
  onSkip: () => void;
};

const onboardingImage2 = require('../assets/images/onbordingscreen2.png');
const onboardingImage3 = require('../assets/images/onbordingscreen3.png');

const ScreenOne: React.FC<ScreenProps> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.gradientOverlay} />

      <View style={styles.screenOneContent}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.subHeadingText}>Transform Your Home</Text>
        <Text style={styles.descriptionText}>See your house redesign in seconds</Text>

        <TouchableOpacity
          style={styles.primaryCircleButton}
          onPress={onNext}
          activeOpacity={0.85}>
          <FontAwesome name="arrow-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.screenOneHouseWrapper}>
        <View style={styles.houseBackground} />
        <FontAwesome
          name="magic"
          size={80}
          color="rgba(139,92,246,0.08)"
          style={styles.magicIcon}
        />
        <FontAwesome
          name="home"
          size={220}
          color="rgba(139,92,246,0.06)"
          style={styles.houseIcon}
        />
      </View>

      <TouchableOpacity
        style={[styles.skipButton, { bottom: insets.bottom + 24 }]}
        onPress={onSkip}
        activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const ScreenTwo: React.FC<ScreenProps> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.screenTwoCardWrapper}>
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

      <View style={styles.screenTwoTextBlock}>
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
        style={[styles.primaryCircleButton, styles.secondaryFloatingButton]}
        onPress={onNext}
        activeOpacity={0.85}>
        <FontAwesome name="arrow-right" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const ScreenThree: React.FC<ScreenProps> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.screenThreeImageWrapper}>
        <Image
          source={onboardingImage3 as ImageSourcePropType}
          style={styles.screenThreeImage}
          resizeMode="contain"
        />
        <View style={styles.screenThreeGradient} />
      </View>

      <View style={styles.screenThreeTextBlock}>
        <Text style={styles.paragraphText}>
          <Text style={styles.boldText}>Save and share </Text>
          <Text>your designs to </Text>
          <Text style={styles.boldText}>get feedback </Text>
          <Text>and make </Text>
          <Text style={styles.boldText}>better renovation decisions</Text>
          <Text>.</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.skipButton, { bottom: insets.bottom + 80 }]}
        onPress={onSkip}
        activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, { bottom: insets.bottom + 24 }]}
        onPress={onNext}
        activeOpacity={0.9}>
        <View style={styles.googleIconCircle}>
          <Text style={styles.googleIconText}>G</Text>
        </View>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const OnboardingFlow: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const totalScreens = 3;

  const handleNext = () => {
    if (currentIndex < totalScreens - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const progress = useMemo(
    () => (currentIndex + 1) / totalScreens,
    [currentIndex, totalScreens],
  );

  let ScreenComponent: React.FC<ScreenProps> = ScreenOne;
  if (currentIndex === 1) {
    ScreenComponent = ScreenTwo;
  } else if (currentIndex === 2) {
    ScreenComponent = ScreenThree;
  }

  return (
    <View style={styles.flowContainer}>
      <ScreenComponent onNext={handleNext} onSkip={handleSkip} />
      <View style={styles.progressBarContainer}>
        <View style={styles.progressTrack} />
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flowContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.6,
    height: 260,
    backgroundColor: '#FFE082',
    opacity: 0.35,
    borderBottomLeftRadius: 180,
  },
  screenOneContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  welcomeText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#000000',
  },
  subHeadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 18,
    color: '#111111',
    marginTop: 18,
    maxWidth: '80%',
  },
  primaryCircleButton: {
    marginTop: 40,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  screenOneHouseWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  houseBackground: {
    position: 'absolute',
    bottom: -40,
    width: width * 0.9,
    height: 260,
    backgroundColor: 'rgba(124,58,237,0.04)',
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
  },
  magicIcon: {
    position: 'absolute',
    bottom: 170,
    left: 32,
  },
  houseIcon: {
    position: 'absolute',
    bottom: -20,
    right: 16,
  },
  skipButton: {
    position: 'absolute',
    left: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#111111',
  },
  screenTwoCardWrapper: {
    marginTop: 36,
    paddingHorizontal: 20,
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
  screenTwoTextBlock: {
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
  secondaryFloatingButton: {
    position: 'absolute',
    right: 24,
    bottom: 88,
  },
  screenThreeImageWrapper: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'flex-end',
  },
  screenThreeImage: {
    width: width * 0.9,
    height: 260,
    borderRadius: 32,
    alignSelf: 'flex-end',
  },
  screenThreeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(255,236,179,0.3)',
  },
  screenThreeTextBlock: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  googleButton: {
    position: 'absolute',
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  googleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 12,
    height: 10,
    justifyContent: 'center',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111111',
  },
});

export default OnboardingFlow;


