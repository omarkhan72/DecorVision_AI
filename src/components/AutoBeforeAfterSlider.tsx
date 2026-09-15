import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    ImageSourcePropType,
    Dimensions,
} from 'react-native';
import FirebaseImage from './FirebaseImage';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay,
} from 'react-native-reanimated';
import adjust from '../utils/Adjust';

const { width } = Dimensions.get('window');

type Props = {
    beforeImage: ImageSourcePropType;
    afterImage: ImageSourcePropType;
    sliderWidth?: number;
    containerStyle?: any;
    startFrom?: 'left' | 'right';
};

const AutoBeforeAfterSlider: React.FC<Props> = ({ beforeImage, afterImage, sliderWidth = width, containerStyle, startFrom = 'right' }) => {
    // Determine initial state and animation targets based on start direction
    // startFrom = 'right' (Default): Start full width (Before visible), wipe to 0 (After visible) -> Move R to L
    // startFrom = 'left': Start 0 width (After visible), wipe to full (Before visible) -> Move L to R

    const initialValue = startFrom === 'left' ? 0 : sliderWidth;
    const firstTarget = startFrom === 'left' ? sliderWidth : 0;
    const secondTarget = startFrom === 'left' ? 0 : sliderWidth;

    const translateX = useSharedValue(initialValue);

    useEffect(() => {
        translateX.value = withRepeat(
            withSequence(
                withDelay(
                    500,
                    withTiming(firstTarget, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                ),
                withDelay(
                    500,
                    withTiming(secondTarget, { duration: 2000, easing: Easing.inOut(Easing.ease) })
                )
            ),
            -1, // Infinite loop
            false // Do not reverse the sequence automatically, we defined the full cycle
        );
    }, [sliderWidth, startFrom]);

    const foregroundStyle = useAnimatedStyle(() => {
        return {
            width: translateX.value,
        };
    });

    const handleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Background Image (After / New) - Always Full */}
            <FirebaseImage
                source={afterImage}
                style={[styles.imageFull, { width: sliderWidth }]}
                resizeMode="cover"
            />

            {/* Foreground Image (Before / Old) - Width Animated */}
            <Animated.View style={[styles.foregroundWrapper, foregroundStyle]}>
                <FirebaseImage
                    source={beforeImage}
                    style={[styles.imageFull, { width: sliderWidth }]}
                    resizeMode="cover"
                />
            </Animated.View>

            {/* Vertical Slider Line & Handle */}
            <Animated.View style={[styles.sliderHandleContainer, handleStyle]}>
                <View style={styles.sliderLine} />
                <View style={styles.sliderHandle}>
                    <View style={styles.sliderHandleDot} />
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        borderBottomLeftRadius: adjust(30),
        borderBottomRightRadius: adjust(30),
    },
    imageFull: {
        width: width,
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    foregroundWrapper: {
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        borderRightWidth: 0,
    },
    sliderHandleContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        width: 0,
    },
    sliderLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: '#FFFFFF',
        opacity: 0.8,
    },
    sliderHandle: {
        width: adjust(40),
        height: adjust(40),
        borderRadius: adjust(20),
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    sliderHandleDot: {
        width: adjust(6),
        height: adjust(6),
        borderRadius: adjust(3),
        backgroundColor: '#D1D5DB',
    },
});

export default AutoBeforeAfterSlider;
