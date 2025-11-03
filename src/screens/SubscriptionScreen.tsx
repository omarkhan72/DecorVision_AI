import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = { onBack: () => void };

const Feature = ({ text }: { text: string }) => (
  <View style={styles.featureRow}>
    <MaterialCommunityIcons name="check-circle" size={16} color="#6D4DF6" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const PlanCard = ({ title, subtitle, price, selected, tag }: { title: string; subtitle: string; price: string; selected?: boolean; tag?: string }) => (
  <View style={[styles.planCard, selected && styles.planCardSelected]}>
    {!!tag && <View style={styles.planTag}><Text style={styles.planTagText}>{tag}</Text></View>}
    <Text style={styles.planTitle}>{title}</Text>
    <Text style={styles.planSubtitle}>{subtitle}</Text>
    <View style={styles.planPriceBox}><Text style={styles.planPrice}>{price}</Text></View>
  </View>
);

const SubscriptionScreen = ({ onBack }: Props) => {
  const [selected, setSelected] = useState<'lifetime' | 'year' | 'week'>('year');

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground source={require('../assets/images/exterior-design.jpg')} style={styles.hero} imageStyle={styles.heroImg}>
        <View style={styles.heroTop}>
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}><FontAwesome name="close" size={16} color="#FFFFFF" /></TouchableOpacity>
          <Text style={styles.restoreText}>Restore</Text>
        </View>
        <View style={styles.heroTitleWrap}>
          <Text style={styles.heroTitle}>Exterior Design</Text>
          <View style={styles.dots}>{[0,1,2].map((i)=> <View key={i} style={[styles.dot, i===1 && styles.dotActive]} />)}</View>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <Feature text="Access to All Feature" />
        <Feature text="Unlimited Home Transformations" />
        <Feature text="Unlock Trending Style" />
        <Feature text="Priority Access to New Content" />
        <Feature text="No Ads, No Watermarks" />

        <View style={styles.planRow}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelected('lifetime')}>
            <PlanCard title="BEST VALUE" subtitle={'Lifetime\n1 Purchase'} price={'Rs 13,900.00'} selected={selected==='lifetime'} />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelected('year')}>
            <PlanCard title="Save 50%" subtitle={'1 Year\n(Rs 159 / Week)'} price={'Rs 8,300.00'} selected={selected==='year'} tag="" />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelected('week')}>
            <PlanCard title="MOST POPULAR" subtitle={'1 Week'} price={'Rs 1,650.00'} selected={selected==='week'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cta}>
          <Text style={styles.ctaText}>Continue</Text>
        </TouchableOpacity>

        <Text style={styles.renewText}>Auto-renewable. Cancel anytime</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity><Text style={styles.link}>User Agreement</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Privacy Policy</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
  hero: {
    height: 220,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroTop: {
    marginTop: 12,
    marginHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  heroTitleWrap: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  dots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  sheet: {
    marginTop: -16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 13,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 14,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    marginHorizontal: 4,
  },
  planCardSelected: {
    borderColor: '#6D4DF6',
    shadowColor: '#6D4DF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  planTag: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#6D4DF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  planTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  planTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  planPriceBox: {
    marginTop: 8,
    backgroundColor: '#F8F7FF',
    borderRadius: 6,
    paddingVertical: 6,
  },
  planPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  cta: {
    backgroundColor: '#6D4DF6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  renewText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
  },
  linksRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: '#6D4DF6',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default SubscriptionScreen;


