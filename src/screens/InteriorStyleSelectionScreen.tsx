import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = { onBack: () => void; onContinue?: () => void };

const InteriorStyleSelectionScreen = ({ onBack, onContinue }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const stylesData = [
    { id: 'modern', name: 'Modern', image: require('../assets/images/interior-design.jpg') },
    { id: 'cozy', name: 'Cozy', image: require('../assets/images/interior-design.jpg') },
    { id: 'luxury', name: 'Luxury', image: require('../assets/images/interior-design.jpg') },
    { id: 'minimalist', name: 'Minimalist', image: require('../assets/images/interior-design.jpg') },
    { id: 'scandinavian', name: 'Scandinavian', image: require('../assets/images/interior-design.jpg') },
    { id: 'airbnb', name: 'Airbnb', image: require('../assets/images/interior-design.jpg') },
    { id: 'midcentury', name: 'Mid Century', image: require('../assets/images/interior-design.jpg') },
    { id: 'rustic', name: 'Rustic', image: require('../assets/images/interior-design.jpg') },
    { id: 'zen', name: 'Zen', image: require('../assets/images/interior-design.jpg') },
    { id: 'tropical', name: 'Tropical', image: require('../assets/images/interior-design.jpg') },
    { id: 'coastal', name: 'Coastal', image: require('../assets/images/interior-design.jpg') },
    { id: 'vintage', name: 'Vintage', image: require('../assets/images/interior-design.jpg') },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interior Inspiration's</Text>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.stepTag}>
            <Text style={styles.stepText}>Step 3/3</Text>
          </View>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Select A Style</Text>

        {/* Style Grid */}
        <View style={styles.stylesGrid}>
          {stylesData.map((styleItem) => (
            <TouchableOpacity
              key={styleItem.id}
              style={styles.styleCard}
              onPress={() => setSelectedStyle(styleItem.id)}
              activeOpacity={0.8}>
              <Image source={styleItem.image} style={styles.styleImage} />
              <Text style={styles.styleName}>{styleItem.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Generate Now Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={onContinue}
          activeOpacity={0.9}
          disabled={!selectedStyle}>
          <View style={[styles.gradient, !selectedStyle && styles.gradientDisabled]}>
            <Text style={styles.generateButtonText}>Generate Now</Text>
          </View>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  stepTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleCard: {
    width: '30%',
    marginBottom: 24,
    alignItems: 'center',
  },
  styleImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  generateButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
  },
  gradientDisabled: {
    backgroundColor: '#D1D5DB',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default InteriorStyleSelectionScreen;

