import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
    visible: boolean;
    onClose: () => void;
    onSubscribe: () => void;
    onWatchAd: () => Promise<void>;
    onUseToken?: () => Promise<void>;
    tokenCount: number;
};

const PLANS = [
    { id: 'weekly', title: 'Weekly', price: '$4.99', sub: 'Week' },
    { id: 'monthly', title: 'Monthly', price: '$12.99', sub: 'Month', popular: true },
    { id: '3months', title: '3 Months', price: '$29.99', sub: '3 Months' },
];

const FEATURES = [
    'Generate Unlimited Designs',
    'Full Ads Free Experience',
    'No Annoying Pop-up Ads',
    'Unlock All Premium Styles',
    'High Quality Rendering',
];

const PaywallBottomSheet = ({
    visible,
    onClose,
    onSubscribe,
    onWatchAd,
    onUseToken,
    tokenCount,
}: Props) => {
    const [isAdLoading, setIsAdLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 300 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const handleWatchAd = async () => {
        setIsAdLoading(true);
        await onWatchAd();
        setIsAdLoading(false);
    };

    const handleUseToken = async () => {
        if (onUseToken) await onUseToken();
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, backdropStyle]}>
                    <TouchableOpacity style={styles.backdropClick} onPress={onClose} />
                </Animated.View>

                {/* Bottom Sheet */}
                <Animated.View style={[styles.sheet, animatedStyle]}>
                    {/* Header with Close Button */}
                    <View style={styles.sheetHeader}>
                        <View style={{ width: 24 }} />
                        <View style={styles.handle} />
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>

                        <Text style={styles.headerTitle}>Unlock Premium</Text>

                        {/* Plans Row */}
                        <View style={styles.plansContainer}>
                            {PLANS.map((plan) => {
                                const isSelected = selectedPlan === plan.id;
                                return (
                                    <TouchableOpacity
                                        key={plan.id}
                                        style={[
                                            styles.planCard,
                                            isSelected && styles.planCardSelected,
                                        ]}
                                        onPress={() => setSelectedPlan(plan.id)}
                                        activeOpacity={0.9}
                                    >
                                        <Text style={[styles.planTitle, isSelected && styles.textSelected]}>
                                            {plan.title}
                                        </Text>
                                        {/* <Text style={[styles.planSub, isSelected && styles.textSelected]}>Most Popular</Text> */}
                                        <Text style={[styles.planPrice, isSelected && styles.textSelected]}>
                                            {plan.price}
                                        </Text>
                                        {plan.popular && (
                                            <View style={styles.popularBadge}>
                                                <Text style={styles.popularText}>Best</Text>
                                            </View>
                                        )}
                                        {isSelected && (
                                            <View style={styles.radioButton}>
                                                <View style={styles.radioInner} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Premium Label */}
                        <View style={styles.premiumLabelContainer}>
                            <View style={styles.premiumLabel}>
                                <Text style={styles.premiumLabelText}>Premium</Text>
                            </View>
                        </View>

                        {/* Features List */}
                        <View style={styles.featuresList}>
                            {FEATURES.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <MaterialCommunityIcons name="check" size={20} color="#1A1A1A" />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Actions */}
                        <View style={styles.actionsContainer}>
                            {/* Subscribe Button (Always Visible) */}
                            <TouchableOpacity style={styles.subscribeButton} onPress={onSubscribe}>
                                <Text style={styles.subscribeButtonText}>Subscribe</Text>
                            </TouchableOpacity>

                            {/* Logic based on tokens */}
                            {tokenCount > 0 ? (
                                <>
                                    {/* Option to Watch Ad */}
                                    <TouchableOpacity
                                        style={[styles.secondaryButton, isAdLoading && styles.disabledButton]}
                                        onPress={handleWatchAd}
                                        disabled={isAdLoading}
                                    >
                                        {isAdLoading ? (
                                            <ActivityIndicator color="#8B5CF6" />
                                        ) : (
                                            <Text style={styles.secondaryButtonText}>Watch Ad to Generate</Text>
                                        )}
                                    </TouchableOpacity>

                                    {/* Option to Use Token */}
                                    <TouchableOpacity style={styles.textButton} onPress={handleUseToken}>
                                        <Text style={styles.textButtonText}>Use 1 Token ({tokenCount} left)</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                /* Zero tokens: Show Cancel */
                                <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.footerLinks}>
                            <Text style={styles.footerText}>Auto-renews</Text>
                            <Text style={styles.footerText}>Cancel anytime</Text>
                        </View>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backdropClick: {
        flex: 1,
    },
    sheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 12,
        marginBottom: 0,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
    },
    closeButton: {
        padding: 4,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20, // Reduced from 40
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    plansContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 10,
    },
    planCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 4,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        position: 'relative',
    },
    planCardSelected: {
        borderColor: '#8B5CF6',
        backgroundColor: '#F3E8FF',
        borderWidth: 2,
    },
    planTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    planPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    textSelected: {
        color: '#8B5CF6',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    popularText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    radioButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#8B5CF6',
    },
    premiumLabelContainer: {
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    premiumLabel: {
        backgroundColor: '#000000',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    premiumLabelText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    featuresList: {
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 12,
        fontWeight: '500',
    },
    actionsContainer: {
        gap: 12,
        marginBottom: 16,
    },
    subscribeButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    subscribeButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#8B5CF6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#8B5CF6',
        fontSize: 15,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    textButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    textButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    footerText: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default PaywallBottomSheet;
