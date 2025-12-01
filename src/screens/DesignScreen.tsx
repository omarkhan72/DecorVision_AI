import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { logScreenView, logButtonClick } from '../utils/crashlytics';
import * as analytics from '../utils/analytics';

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity>
      <Text style={styles.seeAll}>See all »</Text>
    </TouchableOpacity>
  </View>
);

const Card = ({ image, count, label }: { image: any; count: number; label: string }) => (
  <View style={styles.card}>
    <Image source={image} style={styles.cardImage} />
    <View style={styles.cardOverlay}>
      <Text style={styles.cardCount}>{`+${count}`}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  </View>
);

type Props = { onOpenInteriors?: () => void; onOpenExteriors?: () => void };

const DesignScreen = ({ onOpenInteriors, onOpenExteriors }: Props) => {
  // Log screen view
  useEffect(() => {
    logScreenView('DesignScreen');
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Designs Templates :</Text>

      <View style={styles.section}>
        <SectionHeader title={"Interior Inspiration's"} />
        <TouchableOpacity activeOpacity={0.9} onPress={() => {
          logButtonClick('Interior Inspiration Card', 'DesignScreen');
          analytics.logSelectContent('design_template', 'interior', 'Interior Inspiration');
          onOpenInteriors?.();
        }}>
          <Card image={require('../assets/images/interior-design.jpg')} count={82} label="Living Room" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <SectionHeader title={"Exterior Inspiration's"} />
        <TouchableOpacity activeOpacity={0.9} onPress={() => {
          logButtonClick('Exterior Inspiration Card', 'DesignScreen');
          analytics.logSelectContent('design_template', 'exterior', 'Exterior Inspiration');
          onOpenExteriors?.();
        }}>
          <Card image={require('../assets/images/exterior-design.jpg')} count={75} label="House" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 140,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6D4DF6',
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  seeAll: {
    fontSize: 12,
    color: '#6D4DF6',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardCount: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  cardLabel: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
});

export default DesignScreen;


