import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const onboardingImage3 = require('../assets/images/onbordingscreen3.png');

type Props = {
  onNext: () => void;
  onSkip: () => void;
};

const OnboardingScreen3: React.FC<Props> = ({ onNext, onSkip }) => {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      // If successful, call onNext which will complete onboarding
      onNext();
    } catch (error: any) {
      // Error handling is done in AuthContext (cancellation doesn't throw)
      // Only show alert for non-cancellation errors
      if (error?.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert(
          'Sign In Error',
          'Failed to sign in with Google. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

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
        activeOpacity={0.7}
        disabled={isSigningIn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.googleButton,
          { bottom: insets.bottom + 24 },
          isSigningIn && styles.googleButtonDisabled,
        ]}
        onPress={handleGoogleSignIn}
        activeOpacity={0.9}
        disabled={isSigningIn}>
        {isSigningIn ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <View style={styles.googleIconCircle}>
              <Text style={styles.googleIconText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </>
        )}
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
  googleButtonDisabled: {
    opacity: 0.6,
  },
});

export default OnboardingScreen3;


