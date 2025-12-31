import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

type Props = {
    onDismiss: () => void;
    onSubscribe: (planId: string) => void;
};

const FEATURES_LIST = [
    'Unlimited AI Design Generation',
    'Ad-free Experience',
    'Premium Design Styles',
    'High Quality Rendering',
    'Priority Support'
];

const PLANS = [
    {
        id: 'monthly',
        title: 'Monthly Plan',
        price: '$12.99',
        period: '/month',
        badge: 'Most Popular',
        badgeColor: '#8B5CF6',
        borderColor: '#8B5CF6'
    },
    {
        id: 'weekly',
        title: 'Weekly Plan',
        price: '$4.99',
        period: '/week',
        badge: 'Starter Choice',
        badgeColor: '#F59E0B',
        borderColor: '#F59E0B'
    },
    {
        id: '3months',
        title: '3-Month Plan',
        price: '$29.99',
        period: '/3 months',
        badge: 'Best Value',
        badgeColor: '#8B5CF6',
        borderColor: '#8B5CF6'
    },
];

const PaywallScreen = ({ onDismiss, onSubscribe }: Props) => {
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header with Close Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                    <MaterialCommunityIcons name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Title Section */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Unlock Your AI Design Journey!</Text>
                    <Text style={styles.subtitle}>
                        Upgrade for unlimited designs, premium features, and ad-free experience
                    </Text>
                </View>

                {/* Plans Container */}
                <View style={styles.plansContainer}>
                    {PLANS.map((plan) => {
                        const isSelected = selectedPlan === plan.id;

                        return (
                            <TouchableOpacity
                                key={plan.id}
                                style={[
                                    styles.planCard,
                                    { borderColor: plan.borderColor },
                                    isSelected && styles.planCardSelected
                                ]}
                                onPress={() => setSelectedPlan(plan.id)}
                                activeOpacity={0.9}
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <View style={[styles.badge, { backgroundColor: plan.badgeColor }]}>
                                        <Text style={styles.badgeText}>{plan.badge}</Text>
                                    </View>
                                )}

                                {/* Plan Header */}
                                <Text style={[styles.planTitle, { color: plan.badgeColor }]}>{plan.title}</Text>
                                <View style={styles.priceContainer}>
                                    <Text style={[styles.priceAmount, { color: plan.badgeColor }]}>{plan.price}</Text>
                                    <Text style={styles.pricePeriod}>{plan.period}</Text>
                                </View>

                                {/* Divider */}
                                <View style={styles.divider} />

                                {/* Features Inside Card */}
                                <View style={styles.featuresList}>
                                    {FEATURES_LIST.map((feature, idx) => (
                                        <View key={idx} style={styles.featureRow}>
                                            <MaterialCommunityIcons name="check-circle" size={16} color={plan.id === 'weekly' ? '#F59E0B' : '#4ADE80'} />
                                            <Text style={styles.featureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </ScrollView>

            {/* Styled Footer for Action */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.subscribeButton}
                    onPress={() => onSubscribe(selectedPlan)}
                >
                    <Text style={styles.subscribeButtonText}>Continue</Text>
                </TouchableOpacity>
                <Text style={styles.disclaimer}>Auto-renews. Cancel anytime.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
        alignItems: 'flex-end',
        zIndex: 10,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginVertical: 12,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
    },
    plansContainer: {
        gap: 14,
        marginTop: 8,
    },
    planCard: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 14,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    planCardSelected: {
        backgroundColor: '#FAFAFA',
        borderWidth: 2,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    planTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    priceAmount: {
        fontSize: 22,
        fontWeight: '800',
    },
    pricePeriod: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 10,
    },
    featuresList: {
        gap: 6,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 12,
        color: '#4B5563',
        marginLeft: 8,
        fontWeight: '500',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    subscribeButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 8,
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
    disclaimer: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 11,
    },
});

export default PaywallScreen;
