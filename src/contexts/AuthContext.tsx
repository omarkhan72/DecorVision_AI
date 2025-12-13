import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

// Mock Mode: Set to true to use mock responses instead of real API calls
const USE_MOCK_API = false;

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
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
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
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

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

