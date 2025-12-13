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
import { AuthProvider } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import OnboardingFlow from './src/onbordingscreens/OnboardingFlow';
import auth from '@react-native-firebase/auth';
import SignInScreen from './src/screens/SignInScreen';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';
const PUSH_NOTIFICATION_PERMISSION_KEY = '@push_notification_permission_requested';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const {
    requestUserPermission,
    getFCMToken,
    listenToForegroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
  } = usePushNotification();


  // Handle user state changes
  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    // Initialize Crashlytics
    crashlytics().setCrashlyticsCollectionEnabled(true);
    crashlytics().log('App initialized');

    // Initialize Analytics
    analytics().setAnalyticsCollectionEnabled(true);
    analytics().logEvent('app_open');

    // Initialize Push Notifications
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeBackground: (() => void) | undefined;

    initializePushNotifications().then((cleanup) => {
      if (cleanup) {
        unsubscribeForeground = cleanup.foreground;
        unsubscribeBackground = cleanup.background;
      }
    });

    checkOnboardingStatus();

    // Cleanup on unmount
    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeBackground) unsubscribeBackground();
    };
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Check if we've already requested permission
      const permissionRequested = await AsyncStorage.getItem(PUSH_NOTIFICATION_PERMISSION_KEY);

      // Request permission on first app launch
      if (!permissionRequested) {
        const permissionGranted = await requestUserPermission();

        if (permissionGranted) {
          // Get FCM token
          const token = await getFCMToken();
          if (token) {
            console.log('FCM Token:', token);
            // You can save this token to Firestore here if needed
            // await updateFCMTokenInFirestore(userId, token);
          }
        } else {
          console.log('Push notification permission denied');
        }

        // Mark that we've requested permission
        await AsyncStorage.setItem(PUSH_NOTIFICATION_PERMISSION_KEY, 'true');
      } else {
        // Permission was already requested, just get the token
        const token = await getFCMToken();
        if (token) {
          console.log('FCM Token:', token);
        }
      }

      // Set up notification listeners
      const unsubscribeForeground = await listenToForegroundNotifications();
      const unsubscribeBackground = await onNotificationOpenedAppFromBackground();

      // Check if app was opened from a notification when it was quit
      await onNotificationOpenedAppFromQuit();

      // Return cleanup functions
      return {
        foreground: unsubscribeForeground,
        background: unsubscribeBackground,
      };
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      crashlytics().recordError(error as Error);
    }
  };

  const checkOnboardingStatus = async () => {
    // TEMPORARY: Always show onboarding for testing
    // TODO: Restore normal behavior after onboarding is fixed
    setShowOnboarding(true);

    // Original code (commented out for testing):
    // try {
    //   const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    //   setShowOnboarding(completed !== 'true');
    // } catch (error) {
    //   console.error('Error checking onboarding status:', error);
    //   // Show onboarding if there's an error
    //   setShowOnboarding(true);
    // }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  // Show nothing while checking onboarding status or initializing auth
  if (showOnboarding === null || initializing) {
    return null;
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {showOnboarding ? (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        ) : !user ? (
          <SignInScreen />
        ) : (
          <HomeScreen />
        )}
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
