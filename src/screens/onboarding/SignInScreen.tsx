import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const ICON_IMAGE = require('../../assets/iconImage.webp');

const SignInScreen = () => {
    const insets = useSafeAreaInsets();
    const { signInWithGoogle, skipSignIn } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setIsSigningIn(true);
            await signInWithGoogle();
            // Navigation is handled by App.tsx based on auth state
        } catch (error: any) {
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

    const handleSkip = () => {
        try {
            setIsSigningIn(true);
            skipSignIn();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to skip sign in. Please try again.');
            setIsSigningIn(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Purple Circle Background */}
            <View style={styles.purpleCircle} />



            {/* Content */}
            <View style={styles.contentContainer}>
                {/* App Icon/Image */}
                <View style={styles.iconContainer}>
                    <Image
                        source={ICON_IMAGE}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.appName}>DecorVision AI</Text>

                <View style={styles.textContainer}>
                    <Text style={styles.welcomeText}>Welcome!</Text>
                    <Text style={styles.subtitleText}>
                        Sign in to craft beautiful home designs effortlessly.
                    </Text>
                </View>
            </View>

            {/* Google Sign In Button */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={isSigningIn}
                    activeOpacity={0.9}
                >
                    {isSigningIn ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <View style={styles.googleIconCircle}>
                                <Text style={styles.googleIconText}>G</Text>
                            </View>
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    disabled={isSigningIn}
                    activeOpacity={0.9}
                >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    purpleCircle: {
        position: 'absolute',
        top: -height * 0.15, // Adjust to position the circle
        left: -width * 0.1,
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: (width * 1.2) / 2,
        backgroundColor: '#E0E7FF', // Light purple color
        zIndex: -1,
    },

    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: height * 0.1, // Push content down a bit
    },
    iconContainer: {
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    iconImage: {
        width: 120,
        height: 120,
        borderRadius: 20,
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 60,
    },
    textContainer: {
        width: '100%',
        alignItems: 'flex-start',
    },
    welcomeText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#000000',
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 18,
        color: '#111111',
        lineHeight: 26,
    },
    bottomContainer: {
        paddingHorizontal: 24,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366F1', // Purple color matching the design button
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    googleIconCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    googleIconText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EA4335', // Google red color
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    skipButton: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 10,
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default SignInScreen;
