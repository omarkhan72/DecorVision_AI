/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, Alert, Platform } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';
import usePushNotification from './src/hooks/usePushNotification';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/home/HomeScreen';
import OnboardingFlow from './src/onbordingscreens/OnboardingFlow';
import auth from '@react-native-firebase/auth';
import SignInScreen from './src/screens/onboarding/SignInScreen';
import PaywallScreen from './src/screens/home/PaywallScreen';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';


const MainApp = () => {
  const { user } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';
  const [initializing, setInitializing] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showPaywall, setShowPaywall] = useState(true);

  const {
    requestUserPermission,
    getFCMToken,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  } = usePushNotification();

  // Listen to auth state from Firebase directly to handle initialization
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((firebaseUser) => {
      // Auth data handled by AuthContext but we need to stop initializing
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  useEffect(() => {
    // Initialize services
    crashlytics().setCrashlyticsCollectionEnabled(true);
    crashlytics().log('App initialized');
    analytics().setAnalyticsCollectionEnabled(true);
    analytics().logEvent('app_open');

    // Push Notifications
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeBackground: (() => void) | undefined;

    initializePushNotifications().then((cleanup) => {
      if (cleanup) {
        unsubscribeForeground = cleanup.foreground;
        unsubscribeBackground = cleanup.background;
      }
    });

    checkOnboardingStatus();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeBackground) unsubscribeBackground();
    };
  }, []);

  const initializePushNotifications = async () => {
    try {
      const permissionGranted = await requestUserPermission();
      if (permissionGranted) {
        const token = await getFCMToken();
        if (token) console.log('FCM Token:', token);
      }
      const unsubscribeForeground = await listenToForegroundNotifications();
      const unsubscribeBackground = await onNotificationOpenedAppFromBackground();
      await onNotificationOpenedAppFromQuit();
      return { foreground: unsubscribeForeground, background: unsubscribeBackground };
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      crashlytics().recordError(error as Error);
    }
  };

  const checkOnboardingStatus = async () => {
    // TEMPORARY: Always show onboarding for testing, per previous settings
    setShowOnboarding(true);
    // Logic:
    // const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    // setShowOnboarding(completed !== 'true');
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setShowOnboarding(false);
      // After onboarding, Paywall will show if showPaywall is true (default)
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleOnboardingSkip = async () => {
    handleOnboardingComplete();
  };

  if (showOnboarding === null || initializing) {
    return null;
  }

  // Navigation Logic
  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  if (!user) {
    return <SignInScreen />;
  }

  // If user is logged in, check premium status
  // Show Paywall if user is NOT premium and showPaywall is true
  if (!user.isPremium && showPaywall && !user.isGuest) {
    return (
      <PaywallScreen
        onDismiss={() => setShowPaywall(false)}
        onSubscribe={(plan) => {
          console.log('Subscribe to', plan);
          // In a real app, integrate purchase flow here.
          // For now, we can dismiss or navigate to subscription logic (Home logic handles validation)
          // If we dismiss, they go to Home
          setShowPaywall(false);
        }}
      />
    );
  }

  return <HomeScreen />;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <MainApp />
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
