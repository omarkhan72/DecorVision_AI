import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = { onBack: () => void; onContinue?: (imageUri: string | null) => void; userImage?: string | null };

const RoomTypeCleanupScreen = ({ onBack, onContinue, userImage }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedCleanup, setSelectedCleanup] = useState<string | null>(null);

  // Cleanup types arranged in order: Left column, then Right column
  const cleanupTypes = [
    'Furniture',        // Left column - row 1
    'Objects',          // Right column - row 1
    'Clutter',          // Left column - row 2
    'Decorations',      // Right column - row 2
    'Plants',           // Left column - row 3
    'Electronics',      // Right column - row 3
    'Textiles',         // Left column - row 4
    'Artwork',          // Right column - row 4
    'Storage Items',    // Left column - row 5
    'Personal Items',   // Right column - row 5
    'Trash',            // Left column - row 6
    'Damaged Items',    // Right column - row 6
    'Other',            // Left column - row 7
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cleanup Inspiration's</Text>
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
            <Text style={styles.stepText}>Step 2/3</Text>
          </View>
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Select what you want to remove</Text>

        {/* Cleanup Type Grid */}
        <View style={styles.cleanupTypesGrid}>
          {cleanupTypes.map((cleanupType, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.cleanupTypeButton,
                selectedCleanup === cleanupType && styles.cleanupTypeButtonSelected,
              ]}
              onPress={() => setSelectedCleanup(cleanupType)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.cleanupTypeText,
                  selectedCleanup === cleanupType && styles.cleanupTypeTextSelected,
                ]}>
                {cleanupType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => onContinue?.(userImage || null)}
          activeOpacity={0.9}
          disabled={!selectedCleanup}>
          <View style={[styles.gradient, !selectedCleanup && styles.gradientDisabled]}>
            <Text style={styles.continueButtonText}>continue</Text>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  cleanupTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cleanupTypeButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanupTypeButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F8F7FF',
  },
  cleanupTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cleanupTypeTextSelected: {
    color: '#8B5CF6',
    fontWeight: '700',
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
  continueButton: {
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
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
});

export default RoomTypeCleanupScreen;

