import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import analytics from '@react-native-firebase/analytics';
import ConfirmationModal from '../components/ConfirmationModal';

// Mock Mode: Set to true to use mock responses instead of real API calls
const USE_MOCK_API = false;

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPremium?: boolean;
  isGuest?: boolean;
  tokens?: {
    freeTokens: number;
    premiumTokens: number;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  skipSignIn: () => void;
  signOut: () => Promise<void>;
  consumeToken: () => Promise<boolean>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isCheckingProfile = useRef(false);
  const [sessionExpiredVisible, setSessionExpiredVisible] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    // IMPORTANT: Make sure the SHA-1 fingerprint is added to Firebase Console
    // Your app's debug SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
    // System debug SHA-1 (already in Firebase): D7:18:43:72:AA:51:FC:11:75:29:80:76:0B:F5:C5:DD:FE:47:2D:3A
    GoogleSignin.configure({
      webClientId: '586339131877-ighh7qcn7a6nklkogieon2iahqf2vl9h.apps.googleusercontent.com',
      offlineAccess: true, // If you need to access Google APIs on behalf of the user
      forceCodeForRefreshToken: true, // Get a refresh token
      // Add scopes if needed
      scopes: ['profile', 'email'],
    });

    // Listen to Firebase auth state changes
    // Listen to Firebase auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Flag that we are checking/creating profile to prevent premature logout
        isCheckingProfile.current = true;

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });

        // Create user in Firestore if not exists
        try {
          const userRef = firestore().collection('users').doc(firebaseUser.uid);

          try {
            // Try to update lastLoginAt first (Optimistic Update)
            await userRef.update({
              lastLoginAt: firestore.FieldValue.serverTimestamp(),
            });
            // console.log('User document updated in Firestore');
          } catch (updateError: any) {
            // If document not found, create it
            if (updateError.code === 'firestore/not-found') {
              await userRef.set({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                createdAt: firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firestore.FieldValue.serverTimestamp(),
                tokens: {
                  freeTokens: 3,
                  premiumTokens: 0,
                },
              });
              console.log('User document created in Firestore');
              // DEBUG: Alert user on successful creation
              // Alert.alert('Debug', 'New user document created in Firestore for ' + firebaseUser.email);
            } else {
              // Re-throw other errors (e.g., permission-denied)
              throw updateError;
            }
          }

          // Get and save FCM Token
          try {
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
              await userRef.update({
                fcmToken: fcmToken,
              });
              console.log('FCM Token saving to Firestore');
            }
          } catch (tokenError) {
            console.log('Error saving FCM token:', tokenError);
            // Don't crash auth flow for token error
          }

        } catch (error) {
          console.error('Error managing user in Firestore:', error);
          crashlytics().recordError(error as Error);
          // Alert user on error
          Alert.alert('Error', 'Failed to save user to database: ' + (error as Error).message);
        } finally {
          // We are done checking/creating the profile
          isCheckingProfile.current = false;
        }

        // Log user login to analytics
        analytics().setUserId(firebaseUser.uid);
        analytics().setUserProperty('login_method', 'google');
        crashlytics().setUserId(firebaseUser.uid);
        crashlytics().setAttribute('login_method', 'google');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen for real-time user data updates from Firestore
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    if (user?.uid) {
      const userRef = firestore().collection('users').doc(user.uid);

      unsubscribeFirestore = userRef.onSnapshot((doc) => {
        // @ts-ignore: handling type mismatch between versions
        const exists = typeof doc.exists === 'function' ? doc.exists() : doc.exists;
        if (exists) {
          const userData = doc.data();
          const tokens = userData?.tokens || { freeTokens: 0, premiumTokens: 0 };
          const isPremium = tokens.premiumTokens >= 1;

          console.log(`Real-time update: User ${user.uid} isPremium=${isPremium}`);

          setUser((prevUser) => {
            if (!prevUser) return null;
            return {
              ...prevUser,
              isPremium,
              tokens,
            };
          });
        } else {
          // Document does not exist.
          // If we are NOT currently creating the profile (e.g. during login race condition),
          // then this means the account was deleted externally.
          if (!isCheckingProfile.current) {
            console.log('User document deleted externally. Showing expiration modal...');
            setSessionExpiredVisible(true);
          }
        }
      }, (error) => {
        console.error('Error listening to user document:', error);
      });
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user?.uid]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      if (USE_MOCK_API) {
        // Mock mode: Simulate login immediately with fake user
        const mockUser: User = {
          uid: 'mock-user-123',
          email: 'mock.user@example.com',
          displayName: 'Mock User',
          photoURL: null,
        };

        // Simulate a small delay
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

        setUser(mockUser);
        analytics().logEvent('login', { method: 'google', mock: true });
        crashlytics().log('Mock Google Sign-In successful');
        setLoading(false);
        return;
      }

      // Real Google Sign-In flow
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get user info from Google - this opens the email selection dialog
      // Note: signIn() will show the account picker if multiple accounts are available
      console.log('Starting Google Sign-In...');
      const googleUser = await GoogleSignin.signIn();
      console.log('Google Sign-In response:', JSON.stringify(googleUser, null, 2));

      // Get the ID token - the response structure varies by version
      // Try different possible paths
      let idToken: string | undefined;

      if (googleUser.data?.idToken) {
        idToken = googleUser.data.idToken;
      } else if ((googleUser as any).idToken) {
        idToken = (googleUser as any).idToken;
      } else if (googleUser.data?.serverAuthCode) {
        // If we have serverAuthCode, we might need to exchange it
        console.log('Received serverAuthCode, attempting to get idToken...');
      }

      if (!idToken) {
        console.error('Google Sign-In response structure:', googleUser);
        throw new Error('No ID token received from Google Sign-In. Please check the response structure.');
      }

      console.log('ID Token received successfully');

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase with the Google credential
      await auth().signInWithCredential(googleCredential);

      // User is automatically set via onAuthStateChanged listener
      // Loading state will be set to false by onAuthStateChanged
      analytics().logEvent('login', { method: 'google' });
      crashlytics().log('Google Sign-In successful');

    } catch (error: any) {
      setLoading(false);

      // Handle user cancellation (don't show error)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google Sign-In');
        return;
      }

      // Handle other errors
      console.error('Google Sign-In Error:', error);
      crashlytics().recordError(error as Error);
      crashlytics().log(`Google Sign-In failed: ${error.message || 'Unknown error'}`);

      // Re-throw to allow UI to handle it if needed
      throw error;
    }
  };

  const skipSignIn = () => {
    const guestUser: User = {
      uid: 'guest_' + Date.now().toString(),
      email: 'guest@visualsai.app',
      displayName: 'Guest User',
      photoURL: null,
      isPremium: false,
      isGuest: true,
      tokens: { freeTokens: 3, premiumTokens: 0 }
    };
    setUser(guestUser);
    setLoading(false);
  };

  const consumeToken = async (): Promise<boolean> => {
    if (!user || !user.uid) return false;

    const userRef = firestore().collection('users').doc(user.uid);

    try {
      const result = await firestore().runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          console.error('User document does not exist for UID:', user.uid);
          throw new Error('User does not exist');
        }

        const data = userDoc.data();
        const tokens = data?.tokens || { freeTokens: 0, premiumTokens: 0 };
        console.log(`[consumeToken] User: ${user.uid}, Free: ${tokens.freeTokens}, Premium: ${tokens.premiumTokens}`);

        if (tokens.freeTokens > 0) {
          console.log('[consumeToken] Consuming 1 FREE token');
          transaction.update(userRef, {
            'tokens.freeTokens': tokens.freeTokens - 1
          });
          return true;
        } else if (tokens.premiumTokens > 0) {
          console.log('[consumeToken] Consuming 1 PREMIUM token');
          transaction.update(userRef, {
            'tokens.premiumTokens': tokens.premiumTokens - 1
          });
          return true;
        } else {
          console.log('[consumeToken] No tokens available to consume');
          return false;
        }
      });
      return result;
    } catch (error) {
      console.error('Token consumption error', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      setUser(null);
      analytics().logEvent('logout');
      crashlytics().log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      crashlytics().recordError(error as Error);
    }
  };

  const deleteAccount = async () => {
    if (!user || !user.uid) return;

    try {
      setLoading(true);
      console.log('Calling deleteUserAccount Cloud Function...');

      // Import explicitly if not available in scope, but typically imports are at top.
      const functions = getFunctions(undefined, 'us-central1');
      const deleteUserAccountFn = httpsCallable(functions, 'deleteUserAccount');

      const result = await deleteUserAccountFn();
      console.log('Delete account result:', result.data);

      // Sign out locally after successful server-side deletion
      await signOut();

      analytics().logEvent('delete_account');
      crashlytics().log('User account deleted via Cloud Function');
      Alert.alert('Account Deleted', 'Your account has been successfully deleted.');

    } catch (error: any) {
      console.error('Delete account error:', error);
      crashlytics().recordError(error as Error);

      let errorMessage = 'Failed to delete account. Please try again.';
      if (error.code === 'functions/unauthenticated') {
        errorMessage = 'You must be logged in to delete your account.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  const handleSessionExpiredConfirm = async () => {
    setSessionExpiredVisible(false);
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, skipSignIn, signOut, consumeToken, deleteAccount }}>
      {children}
      <ConfirmationModal
        visible={sessionExpiredVisible}
        title="Session Expired"
        message="Your account has been deleted. You will now be logged out."
        confirmText="OK"
        onConfirm={handleSessionExpiredConfirm}
        onCancel={() => { }} // Not used with singleButton
        singleButton={true}
        isDestructive={false}
      />
    </AuthContext.Provider>
  );
};

