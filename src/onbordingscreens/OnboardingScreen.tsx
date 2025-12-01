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
import Svg, { Path } from 'react-native-svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

type Props = {
  onComplete: () => void;
  onSkip: () => void;
};

const OnboardingScreen: React.FC<Props> = ({ onComplete, onSkip }) => {
  const insets = useSafeAreaInsets();

  // House outline SVG path (house shape with chimney, windows, door, and roof)
  const housePath = `
    M 50 450
    L 50 550
    L 150 550
    L 150 500
    L 200 500
    L 200 550
    L 300 550
    L 300 450
    L 250 450
    L 250 400
    L 100 400
    L 100 450
    Z
    M 70 470
    L 70 490
    L 90 490
    L 90 470
    Z
    M 210 470
    L 210 490
    L 230 490
    L 230 470
    Z
    M 130 500
    L 130 530
    L 150 530
    L 150 500
    Z
    M 175 400
    L 100 400
    L 100 350
    L 250 350
    L 250 400
    Z
    M 40 450
    L 40 420
    L 60 420
    L 60 450
    Z
  `;

  // Sparkle/magic icon paths (star-like shapes with 8 points)
  const sparklePath1 = `
    M 60 200
    L 65 215
    L 80 210
    L 70 225
    L 85 230
    L 70 235
    L 80 250
    L 65 245
    L 60 260
    L 55 245
    L 40 250
    L 50 235
    L 35 230
    L 50 225
    L 40 210
    L 55 215
    Z
  `;

  const sparklePath2 = `
    M 100 170
    L 103 182
    L 115 179
    L 107 191
    L 119 194
    L 107 197
    L 115 209
    L 103 206
    L 100 218
    L 97 206
    L 85 209
    L 93 197
    L 81 194
    L 93 191
    L 85 179
    L 97 182
    Z
  `;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background gradient overlay (warm yellowish-orange in upper right) */}
      <View style={styles.gradientOverlay} />

      {/* Main Content - Left aligned */}
      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.subHeadingText}>Transform Your Home</Text>
        <Text style={styles.descriptionText}>See your house redesign in seconds</Text>

        {/* Purple CTA Button with white arrow */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onComplete}
          activeOpacity={0.8}>
          <FontAwesome name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Graphics Section */}
      <View style={styles.graphicsContainer}>
        {/* Sparkle icons */}
        <Svg
          width={60}
          height={60}
          style={[styles.sparkle1, { opacity: 0.3 }]}>
          <Path
            d={sparklePath1}
            fill="#B19CD9"
            stroke="#B19CD9"
            strokeWidth="1"
          />
        </Svg>

        <Svg
          width={50}
          height={50}
          style={[styles.sparkle2, { opacity: 0.3 }]}>
          <Path
            d={sparklePath2}
            fill="#B19CD9"
            stroke="#B19CD9"
            strokeWidth="1"
          />
        </Svg>

        {/* House outline graphic */}
        <Svg
          width={width * 0.8}
          height={height * 0.4}
          style={styles.houseGraphic}
          viewBox="0 0 350 600"
          preserveAspectRatio="xMidYMid meet">
          <Path
            d={housePath}
            fill="#B19CD9"
            stroke="#B19CD9"
            strokeWidth="3"
            opacity={0.35}
          />
        </Svg>
      </View>

      {/* Skip button - bottom left */}
      <TouchableOpacity
        style={[styles.skipButton, { bottom: insets.bottom + 20 }]}
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
    height: height * 0.5,
    backgroundColor: '#FFE082', // Warm yellowish-orange
    opacity: 0.15,
    borderBottomLeftRadius: 150,
  },
  contentContainer: {
    paddingLeft: 30,
    paddingTop: 60,
    zIndex: 2,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subHeadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 40,
  },
  ctaButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6', // Purple
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  graphicsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    zIndex: 1,
  },
  sparkle1: {
    position: 'absolute',
    left: 30,
    bottom: height * 0.38,
  },
  sparkle2: {
    position: 'absolute',
    left: 80,
    bottom: height * 0.42,
  },
  houseGraphic: {
    position: 'absolute',
    bottom: -50,
    left: width * 0.1,
    width: width * 0.8,
  },
  skipButton: {
    position: 'absolute',
    left: 30,
    zIndex: 3,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
});

export default OnboardingScreen;

