import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import {PermissionsAndroid, Platform} from 'react-native';

const usePushNotification = () => {
  const requestUserPermission = async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    } else if (Platform.OS === 'android' && Platform.Version >= 33) {
      const res = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      const granted = res === PermissionsAndroid.RESULTS.GRANTED;
      return granted;
    } else {
      return true;
    }
  };

  const getFCMToken = async () => {
    try {
      // Check if we have permission first
      const authStatus = await messaging().hasPermission();
      if (authStatus === messaging.AuthorizationStatus.DENIED) {
        const permissionGranted = await requestUserPermission();
        if (!permissionGranted) {
          return null;
        }
      }
      // Get the token
      try {
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          return fcmToken;
        } else {
          return null;
        }
      } catch (tokenError: any) {
        console.log('Error getting FCM token:', tokenError?.message);
        return null;
      }
    } catch (error: any) {
      console.log('Failed to get FCM token:', error?.message);
      return null;
    }
  };

  const listenToForegroundNotifications = async () => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
      // You can show a local notification here if needed
      // Or handle the notification data as needed
    });
    return unsubscribe;
  };

  const listenToBackgroundNotifications = async () => {
    const unsubscribe = messaging().setBackgroundMessageHandler(async _remoteMessage => {});
    return unsubscribe;
  };

  const onNotificationOpenedAppFromBackground = async () => {
    const unsubscribe = messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('Notification opened app from background:', remoteMessage);
      // Handle navigation or other actions when notification is tapped
    });
    return unsubscribe;
  };

  const onNotificationOpenedAppFromQuit = async () => {
    const message = await messaging().getInitialNotification();

    if (message) {
      console.log('Notification opened app from quit state:', message);
      // Handle navigation or other actions when app was opened from notification
    }
  };

  const updateFCMTokenInFirestore = async (
    userId: string,
    fcmToken: string,
    removeToken: boolean = false,
  ) => {
    console.log({fcmToken});
    
    // Don't proceed if fcmToken is undefined, null, or empty
    if (!fcmToken) {
      console.log('FCM token is empty or undefined, skipping update');
      return;
    }
    
    try {
      const userRef = firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        console.log('User document does not exist yet, skipping FCM token update');
        return;
      }
      
      await userRef.update({
        fcmTokens: !removeToken
          ? firestore.FieldValue.arrayUnion(fcmToken)
          : firestore.FieldValue.arrayRemove(fcmToken),
      });
      
      console.log(`FCM token ${removeToken ? 'removed' : 'added'} successfully`);
    } catch (error) {
      console.error('Error updating FCM token in Firestore:', error);
    }
  };

  return {
    requestUserPermission,
    getFCMToken,
    listenToForegroundNotifications,
    listenToBackgroundNotifications,
    onNotificationOpenedAppFromBackground,
    onNotificationOpenedAppFromQuit,
    updateFCMTokenInFirestore,
  };
};

export default usePushNotification;
