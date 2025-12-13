import React from 'react';
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

const onboardingImage3 = require('../assets/images/onbordingscreen3.png');

type Props = {
  onNext: () => void;
  onSkip: () => void;
};

const OnboardingScreen3: React.FC<Props> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.imageWrapper}>
        <Image
          source={onboardingImage3 as ImageSourcePropType}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.topGradient} />
      </View>

      <View style={styles.textBlock}>
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
        style={[styles.primaryCircleButton, styles.floatingButton, { bottom: insets.bottom + 24 }]}
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
  imageWrapper: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'flex-end',
  },
  image: {
    width: width * 0.9,
    height: 260,
    borderRadius: 32,
    alignSelf: 'flex-end',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(255,236,179,0.3)',
  },
  textBlock: {
    marginTop: 40,
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
  floatingButton: {
    position: 'absolute',
    right: 24,
  },
});

export default OnboardingScreen3;


