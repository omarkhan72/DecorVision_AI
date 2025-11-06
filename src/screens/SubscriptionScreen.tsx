import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = { onBack: () => void };

const Feature = ({ text, icon }: { text: string; icon: string }) => (
  <View style={styles.featureRow}>
    <MaterialCommunityIcons name={icon as any} size={16} color="#8B5CF6" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const PlanCard = ({ title, subtitle, price, selected, tag }: { title: string; subtitle: string; price: string; selected?: boolean; tag?: string }) => (
  <View style={[styles.planCard, selected && styles.planCardSelected]}>
    {!!tag && (
      <View style={[styles.planTag, selected && styles.planTagSelected]}>
        <Text style={[styles.planTagText, selected && styles.planTagTextSelected]}>{tag}</Text>
      </View>
    )}
    <Text style={styles.planTitle}>{title}</Text>
    <Text style={styles.planSubtitle}>{subtitle}</Text>
    <View style={styles.planPriceBox}><Text style={styles.planPrice}>{price}</Text></View>
  </View>
);

const SubscriptionScreen = ({ onBack }: Props) => {
  const [selected, setSelected] = useState<'lifetime' | 'year' | 'week'>('year');

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground source={require('../assets/images/interior-design.jpg')} style={styles.hero} imageStyle={styles.heroImg}>
        <View style={styles.heroTop}>
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <FontAwesome name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.restoreText}>Restore</Text>
        </View>
        <View style={styles.heroTitleWrap}>
          <Text style={styles.heroTitle}>Interior Design</Text>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <Feature text="Access to All Feature" icon="view-grid-outline" />
        <Feature text="Unlimited Home Transformations" icon="brush" />
        <Feature text="Unlock Trending Style" icon="lock-open-outline" />
        <Feature text="Priority Access to New Content" icon="bell-outline" />
        <Feature text="No Ads, No Watermarks" icon="close-circle-outline" />

        <View style={styles.planRow}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelected('lifetime')}>
            <PlanCard title="BEST VALUE" subtitle={'Lifetime\n1 Purchase'} price={'Rs 13,900.00'} selected={selected==='lifetime'} tag="BEST VALUE" />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelected('year')}>
            <PlanCard title="Save 90%" subtitle={'1\nYear\n(Rs 159.62 / (Week))'} price={'Rs 8,300.00'} selected={selected==='year'} tag="Save 90%" />
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelected('week')}>
            <PlanCard title="MOST POPULAR" subtitle={'1\nWeek'} price={'Rs 1,650.00'} selected={selected==='week'} tag="MOST POPULAR" />
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 20,
    height: 4,
    borderRadius: 2,
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
    color: '#1A1A1A',
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
    borderColor: '#8B5CF6',
    borderWidth: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  planTag: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  planTagSelected: {
    backgroundColor: '#8B5CF6',
  },
  planTagText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  planTagTextSelected: {
    color: '#FFFFFF',
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
    lineHeight: 14,
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
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
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
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default SubscriptionScreen;


