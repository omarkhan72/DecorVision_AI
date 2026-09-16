import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { logScreenView, logButtonClick } from '../../utils/crashlytics';
import * as analytics from '../../utils/analytics';
import { useFirebaseImagePaths } from '../../hooks/useFirebaseImagePaths';

const SUBSCRIPTION_IMAGES = ['interior-design.webp'];

const { height } = Dimensions.get('window');

type Props = { onBack: () => void };

const Feature = ({ text, icon }: { text: string; icon: string }) => (
  <View style={styles.featureRow}>
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={icon as any} size={20} color="#7C3AED" />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const SubscriptionScreen = ({ onBack }: Props) => {
  const [selected, setSelected] = useState<'lifetime' | 'year' | 'week'>('year');
  const { images } = useFirebaseImagePaths(SUBSCRIPTION_IMAGES);

  useEffect(() => {
    logScreenView('SubscriptionScreen');
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={images['interior-design.webp'] || { uri: '' }}
        style={styles.hero}
        imageStyle={styles.heroImg}
      >
        <View style={styles.heroOverlay}>
          <TouchableOpacity
            onPress={() => {
              logButtonClick('Close Button', 'SubscriptionScreen');
              onBack();
            }}
            style={styles.closeBtn}
          >
            <FontAwesome name="close" size={18} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.restoreBtn}>Restore</Text>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Interior Design</Text>
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.bottomSheet}>
        <View style={styles.featuresList}>
          <Feature text="Access to All Feature" icon="view-grid-outline" />
          <Feature text="Unlimited Home Transformations" icon="brush" />
          <Feature text="Unlock Trending Style" icon="lock-open-outline" />
          <Feature text="Priority Access to New Content" icon="bell-outline" />
          <Feature text="No Ads, No Watermarks" icon="close-circle-outline" />
        </View>

        <View style={styles.plansContainer}>
          {/* Lifetime Plan */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelected('lifetime')}
            style={[styles.planCard, selected === 'lifetime' && styles.selectedCard]}
          >
            <Text style={styles.planEyebrow}>BEST VALUE</Text>
            <View style={styles.planContent}>
              <Text style={styles.planMainText}>Lifetime</Text>
              <Text style={styles.planSubText}>1 Purchase</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>Rs 13,900.00</Text>
            </View>
          </TouchableOpacity>

          {/* Year Plan (Featured) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelected('year')}
            style={[styles.planCard, styles.featuredCard, selected === 'year' && styles.selectedFeaturedCard]}
          >
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredHeaderText}>Save 90%</Text>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredMainText}>1</Text>
              <Text style={styles.featuredSubText}>Year</Text>
              <Text style={styles.featuredMicroText}>(Rs 159.62 / (Week))</Text>
            </View>
            <View style={styles.featuredPriceContainer}>
              <Text style={styles.featuredPriceText}>Rs 8,300.00</Text>
            </View>
          </TouchableOpacity>

          {/* Week Plan */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelected('week')}
            style={[styles.planCard, selected === 'week' && styles.selectedCard]}
          >
            <Text style={styles.planEyebrow}>MOST POPULAR</Text>
            <View style={styles.planContent}>
              <Text style={styles.planMainText}>1</Text>
              <Text style={styles.planSubText}>Week</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>Rs 1,650.00</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={() => {
          logButtonClick('Subscribe Continue Button', 'SubscriptionScreen');
          analytics.logEvent('subscription_continue', { plan: selected });
        }}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>Auto-renewable. Cancel anytime</Text>

        <View style={styles.footerLinks}>
          <TouchableOpacity><Text style={styles.linkText}>User Agreement</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.linkText}>Privacy Policy</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  hero: {
    height: height * 0.45,
    width: '100%',
    justifyContent: 'space-between',
  },
  heroImg: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 5,
  },
  restoreBtn: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  heroContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FFF',
  },
  bottomSheet: {
    flex: 1,
    marginTop: -20,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 140,
  },
  featuredCard: {
    flex: 1.1,
    height: 160,
    borderColor: '#7C3AED',
    paddingVertical: 0,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    borderColor: '#7C3AED',
    borderWidth: 1.5,
  },
  selectedFeaturedCard: {
  },
  planEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 4,
    textAlign: 'center',
  },
  planContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  planMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  planSubText: {
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 2,
  },
  priceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  featuredHeader: {
    width: '100%',
    backgroundColor: '#7C3AED',
    paddingVertical: 6,
    alignItems: 'center',
  },
  featuredHeaderText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  featuredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  featuredMainText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  featuredSubText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  featuredMicroText: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  featuredPriceContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  featuredPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
  },
  continueBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 6,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  linkText: {
    color: '#9CA3AF',
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});

export default SubscriptionScreen;


