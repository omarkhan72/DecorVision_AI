import crashlytics from '@react-native-firebase/crashlytics';
import * as analytics from './analytics';

/**
 * Log a screen view to Crashlytics and Analytics
 */
export const logScreenView = (screenName: string) => {
  try {
    // Log to Crashlytics
    crashlytics().log(`Screen viewed: ${screenName}`);
    crashlytics().setAttribute('last_screen', screenName);
    
    // Log to Analytics
    analytics.logScreenView(screenName);
  } catch (error) {
    console.error('Error logging screen view:', error);
  }
};

/**
 * Log a button click to Crashlytics and Analytics
 */
export const logButtonClick = (buttonName: string, screenName?: string) => {
  try {
    // Log to Crashlytics
    const logMessage = screenName 
      ? `Button clicked: ${buttonName} on ${screenName}`
      : `Button clicked: ${buttonName}`;
    crashlytics().log(logMessage);
    crashlytics().setAttribute('last_button_clicked', buttonName);
    if (screenName) {
      crashlytics().setAttribute('last_screen', screenName);
    }
    
    // Log to Analytics
    analytics.logButtonClick(buttonName, screenName);
  } catch (error) {
    console.error('Error logging button click:', error);
  }
};

/**
 * Log a user action to Crashlytics
 */
export const logUserAction = (action: string, details?: Record<string, string>) => {
  try {
    crashlytics().log(`User action: ${action}`);
    if (details) {
      Object.entries(details).forEach(([key, value]) => {
        crashlytics().setAttribute(key, value);
      });
    }
  } catch (error) {
    console.error('Error logging user action to Crashlytics:', error);
  }
};

/**
 * Log an error to Crashlytics
 */
export const logError = (error: Error, context?: string) => {
  try {
    if (context) {
      crashlytics().log(`Error in ${context}: ${error.message}`);
    }
    crashlytics().recordError(error);
  } catch (err) {
    console.error('Error logging to Crashlytics:', err);
  }
};

/**
 * Set user identifier for Crashlytics
 */
export const setUserId = (userId: string) => {
  try {
    crashlytics().setUserId(userId);
  } catch (error) {
    console.error('Error setting user ID in Crashlytics:', error);
  }
};

/**
 * Set custom attributes for Crashlytics
 */
export const setAttribute = (key: string, value: string) => {
  try {
    crashlytics().setAttribute(key, value);
  } catch (error) {
    console.error('Error setting attribute in Crashlytics:', error);
  }
};

