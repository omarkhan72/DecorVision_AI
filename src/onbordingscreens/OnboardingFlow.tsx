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
import OnboardingScreen3 from './OnboardingScreen3';
import OnboardingScreen1 from './OnboardingScreen1';
import OnboardingScreen2 from './OnboardingScreen2';


const { width } = Dimensions.get('window');

type Props = {
  onComplete: () => void;
  onSkip: () => void;
};

type ScreenProps = {
  onNext: () => void;
  onSkip: () => void;
};



// ScreenThree is now handled by OnboardingScreen3 component

const OnboardingFlow: React.FC<Props> = ({ onComplete, onSkip }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const totalScreens = 3;

  const handleNext = async () => {
    if (currentIndex < totalScreens - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // On the last screen, complete onboarding
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

  // Render the last screen separately to pass signInWithGoogle
  if (currentIndex === 2) {
    return (
      <View style={styles.flowContainer}>
        <OnboardingScreen3 onNext={handleNext} onSkip={handleSkip} />
      </View>
    );
  }

  let ScreenComponent: React.FC<any> = OnboardingScreen1;
  if (currentIndex === 1) {
    ScreenComponent = OnboardingScreen2;
  }

  return (
    <View style={styles.flowContainer}>
      <ScreenComponent onNext={handleNext} onSkip={handleSkip} />
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


