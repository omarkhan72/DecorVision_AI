import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useFirebaseImagePaths } from '../hooks/useFirebaseImagePaths';
import FirebaseImageBackground from '../components/FirebaseImageBackground';

const IMAGES = ['interior-design.webp', 'exterior-design.webp'];
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logScreenView, logButtonClick } from '../utils/crashlytics';
import * as analytics from '../utils/analytics';

const SectionHeader = ({ title, onPress }: { title: string; onPress?: () => void }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.seeAll}>See all {'>'}{'>'}</Text>
    </TouchableOpacity>
  </View>
);

const Card = ({ image, count, label }: { image: any; count?: number; label?: string }) => (
  <View style={styles.cardContainer}>
    <FirebaseImageBackground source={image} style={styles.cardImage} imageStyle={{ borderRadius: 16 }}>
      <View style={styles.overlayGradient}>
        {count && <Text style={styles.countText}>+{count}</Text>}
        {label && <Text style={styles.labelText}>{label}</Text>}
      </View>
    </FirebaseImageBackground>
  </View>
);

type Props = { onOpenInteriors?: () => void; onOpenExteriors?: () => void };

const DesignScreen = ({ onOpenInteriors, onOpenExteriors }: Props) => {
  const insets = useSafeAreaInsets();
  const { images } = useFirebaseImagePaths(IMAGES);

  useEffect(() => {
    logScreenView('DesignScreen');
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>


      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Interior Section */}
        <View style={styles.section}>
          <SectionHeader title="Interior Inspiration's" onPress={onOpenInteriors} />
          <TouchableOpacity activeOpacity={0.9} onPress={() => {
            logButtonClick('Interior Inspiration Card', 'DesignScreen');
            analytics.logSelectContent('design_template', 'interior', 'Interior Inspiration');
            onOpenInteriors?.();
          }}>
            <Card
              image={images['interior-design.webp'] || { uri: '' }}
              count={82}
              label="Living Room"
            />
          </TouchableOpacity>
        </View>

        {/* Exterior Section */}
        <View style={styles.section}>
          <SectionHeader title="Exterior Inspiration's" onPress={onOpenExteriors} />
          <TouchableOpacity activeOpacity={0.9} onPress={() => {
            logButtonClick('Exterior Inspiration Card', 'DesignScreen');
            analytics.logSelectContent('design_template', 'exterior', 'Exterior Inspiration');
            onOpenExteriors?.();
          }}>
            <Card
              image={images['exterior-design.webp'] || { uri: '' }}
              count={75}
              label="House"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Mockup */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom || 20 }]}>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="home" size={24} color="#C4C4C4" />
          <Text style={styles.navTextInactive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNavIcon}>
            <FontAwesome name="magic" size={20} color="#6D4DF6" />
          </View>
          <Text style={styles.navTextActive}>Design</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <FontAwesome name="history" size={24} color="#C4C4C4" />
          <Text style={styles.navTextInactive}>History</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6D4DF6', // Design Blue/Purple
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBadge: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  proText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  settingsBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#6D4DF6',
    fontWeight: '600',
  },
  cardContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlayGradient: {
    paddingBottom: 20,
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  countText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  labelText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavIcon: {
  },
  navTextActive: {
    fontSize: 10,
    color: '#6D4DF6',
    fontWeight: '700',
    marginTop: 4,
  },
  navTextInactive: {
    fontSize: 10,
    color: '#C4C4C4',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default DesignScreen;


