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

const RoomTypeReplaceScreen = ({ onBack, onContinue, userImage }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedReplace, setSelectedReplace] = useState<string | null>(null);

  // Replace types arranged in order: Left column, then Right column
  const replaceTypes = [
    'Furniture',        // Left column - row 1
    'Wall',             // Right column - row 1
    'Floor',            // Left column - row 2
    'Ceiling',          // Right column - row 2
    'Door',             // Left column - row 3
    'Window',           // Right column - row 3
    'Lighting',         // Left column - row 4
    'Decor',            // Right column - row 4
    'Appliances',       // Left column - row 5
    'Fixtures',         // Right column - row 5
    'Cabinets',         // Left column - row 6
    'Countertop',       // Right column - row 6
    'Other',            // Left column - row 7
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Replace Inspiration's</Text>
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
        <Text style={styles.sectionTitle}>Select what you want to replace</Text>

        {/* Replace Type Grid */}
        <View style={styles.replaceTypesGrid}>
          {replaceTypes.map((replaceType, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.replaceTypeButton,
                selectedReplace === replaceType && styles.replaceTypeButtonSelected,
              ]}
              onPress={() => setSelectedReplace(replaceType)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.replaceTypeText,
                  selectedReplace === replaceType && styles.replaceTypeTextSelected,
                ]}>
                {replaceType}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => onContinue?.(userImage)}
          activeOpacity={0.9}
          disabled={!selectedReplace}>
          <View style={[styles.gradient, !selectedReplace && styles.gradientDisabled]}>
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
  replaceTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  replaceTypeButton: {
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
  replaceTypeButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F8F7FF',
  },
  replaceTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  replaceTypeTextSelected: {
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

export default RoomTypeReplaceScreen;

