import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { generateDesignDirectly } from '../../services/GeminiDirectService';
import { logScreenView, logButtonClick } from '../../utils/crashlytics';
import * as analytics from '../../utils/analytics';
import { convertImageToBase64 } from '../../utils/imageUtils';

type Props = {
  onBack: () => void;
  onContinue?: (imageUri: string | null) => void;
  userImage?: string | null;
  roomType?: string | null;
};

interface DesignResponse {
  success: boolean;
  message?: string;
  hasImage?: boolean;
  designType?: string;
  roomType?: string;
  style?: string;
  prompt?: string;
  generatedDescription?: string;
  imageDataUri?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

const NewWallsStyleSelectionScreen = ({ onBack, onContinue, userImage, roomType }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stylesData = [
    { id: 'modern', name: 'Modern', image: require('../../assets/Interior (1).webp') },
    { id: 'cozy', name: 'Cozy', image: require('../../assets/Interior (2).webp') },
    { id: 'luxury', name: 'Luxury', image: require('../../assets/interiorslide1.webp') },
    { id: 'minimalist', name: 'Minimalist', image: require('../../assets/interiorslide2.webp') },
    { id: 'scandinavian', name: 'Scandinavian', image: require('../../assets/interior-design.webp') },
    { id: 'airbnb', name: 'Airbnb', image: require('../../assets/Garden (1).webp') },
    { id: 'midcentury', name: 'Mid Century', image: require('../../assets/Garden (2).webp') },
    { id: 'rustic', name: 'Rustic', image: require('../../assets/Gardenslide1.webp') },
    { id: 'zen', name: 'Zen', image: require('../../assets/Gardenslide2.webp') },
    { id: 'tropical', name: 'Tropical', image: require('../../assets/garden-design.webp') },
    { id: 'coastal', name: 'Coastal', image: require('../../assets/exterior-design.webp') },
    { id: 'vintage', name: 'Vintage', image: require('../../assets/new-walls.webp') },
  ];


  // Map style to wall material prompt
  const getWallsPrompt = (style: string): string => {
    const styleDescriptions: Record<string, string> = {
      modern: 'modern sleek walls, such as smooth designer matte paint and subtle architectural paneling',
      cozy: 'warm cozy walls with textured Venetian plaster and soft earthy tones',
      luxury: 'luxurious premium walls featuring silk wallpaper, subtle gold/bronze metallic inlays, and high-end wainscoting',
      minimalist: 'minimalist crisp white walls with subtle natural lime-wash texture',
      scandinavian: 'scandinavian style light oak wood slatted accent walls and soft neutral paint',
      airbnb: 'stylish and welcoming accent feature wall with contemporary geometric wallpaper',
      midcentury: 'mid-century modern walnut wood paneling and retro patterned accent wall',
      rustic: 'rustic exposed brickwork, reclaimed timber wall planks, and natural stone textures',
      zen: 'zen-inspired Japanese shoji-inspired subtle textured wall finishes with bamboo accents',
      tropical: 'tropical botanical luxury wallpaper with lush palm motifs and deep emerald tones',
      coastal: 'coastal style crisp white shiplap walls and soft sea-spray blue accents',
      vintage: 'vintage Victorian damask wallpaper with classic ornate crown molding',
    };

    const desc = styleDescriptions[style.toLowerCase()] || `${style} style walls`;
    return `Redesign the walls of this room with new ${desc}. Maintain the exact furniture, flooring, ceiling, windows, and room dimensions. Photorealistic, 8k resolution, architectural interior photography.`;
  };

  const handleGenerate = async () => {
    logButtonClick('Generate Button', 'NewWallsStyleSelectionScreen');

    console.log('=== Generate Button Pressed (New Walls) ===');
    console.log('Selected style:', selectedStyle);
    console.log('Room type:', roomType);
    console.log('Has user image:', !!userImage);

    // Log design generation to Analytics
    if (selectedStyle && roomType) {
      await analytics.logDesignGeneration('newwalls', roomType, selectedStyle);
    }

    if (!selectedStyle || !roomType) {
      console.warn('Validation failed: Missing style or room type');
      Alert.alert('Error', 'Please select a style and room type');
      return;
    }

    console.log('Starting direct walls design generation...');
    setIsGenerating(true);

    try {
      // Convert user image to base64 if provided
      let imageBase64 = null;
      if (userImage) {
        console.log('Converting user image to base64...');
        imageBase64 = await convertImageToBase64(userImage);
        if (!imageBase64) {
          console.warn('Failed to convert image, continuing without image input');
        }
      }

      // Generate prompt from style
      const prompt = getWallsPrompt(selectedStyle);
      console.log('Calling GeminiDirectService with prompt:', prompt);

      const responseData = await generateDesignDirectly(imageBase64, prompt);

      console.log('=== Direct Walls Generation Response ===');
      console.log('Success:', responseData?.success);
      console.log('Has image:', responseData?.hasImage);

      if (responseData?.success && (responseData?.imageDataUri || responseData?.imageBase64)) {
        let generatedImageUri = responseData.imageDataUri;
        if (!generatedImageUri && responseData.imageBase64) {
          generatedImageUri = `data:${responseData.imageMimeType || 'image/jpeg'};base64,${responseData.imageBase64}`;
        }

        if (generatedImageUri) {
          console.log('Generated image received, length:', generatedImageUri.length);
          console.log('Navigating to result screen with generated image');
          onContinue?.(generatedImageUri);
        } else {
          throw new Error('No image returned from walls generation service');
        }
      } else {
        throw new Error(responseData?.message || 'Failed to generate walls design');
      }
    } catch (error: any) {
      console.error('=== Error in handleGenerate ===', error?.message || error);
      let errorMessage = error?.message || 'Failed to generate design. Please try again.';
      Alert.alert('Error', errorMessage);
      setIsGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          logButtonClick('Back Button', 'NewWallsStyleSelectionScreen');
          onBack();
        }} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Walls Inspiration's</Text>
        <TouchableOpacity onPress={() => {
          logButtonClick('Close Button', 'NewWallsStyleSelectionScreen');
          onBack();
        }} style={styles.closeButton}>
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
                onPress={() => {
                  logButtonClick(`Style Selected: ${styleItem.name}`, 'NewWallsStyleSelectionScreen');
                  setSelectedStyle(styleItem.id);
                }}
                activeOpacity={0.8}>
                <View style={styles.imageContainer}>
                  <Image
                    source={styleItem.image}
                    style={styles.styleImage}
                  />
                  {selectedStyle === styleItem.id && (
                    <View style={styles.selectedRing} />
                  )}
                </View>
                <Text
                  style={[
                    styles.styleName,
                    selectedStyle === styleItem.id && styles.styleNameSelected,
                  ]}>
                  {styleItem.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

      {/* Generate Now Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
          activeOpacity={0.9}
          disabled={!selectedStyle || isGenerating}>
          <View style={[styles.gradient, (!selectedStyle || isGenerating) && styles.gradientDisabled]}>
            {isGenerating ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>Generate Now</Text>
            )}
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
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  styleImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F4F6',
  },
  selectedRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 51,
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  styleNameSelected: {
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default NewWallsStyleSelectionScreen;

