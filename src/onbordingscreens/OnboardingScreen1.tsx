import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

type Props = {
  onNext: () => void;
  onSkip: () => void;
};

const OnboardingScreen1: React.FC<Props> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.gradientOverlay} />

      <View style={styles.content}>
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

      <View style={styles.houseWrapper}>
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

const styles = StyleSheet.create({
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
  content: {
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
  houseWrapper: {
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
});

export default OnboardingScreen1;


