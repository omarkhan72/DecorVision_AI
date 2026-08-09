import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { logScreenView, logButtonClick } from '../utils/crashlytics';
import * as analytics from '../utils/analytics';
import { useFirebaseImagePaths } from '../hooks/useFirebaseImagePaths';
import { convertImageToBase64 } from '../utils/imageUtils';
import { StyleSelectionSkeleton } from '../components/SkeletonLoader';

// Mock Mode: Set to true to use mock responses instead of real API calls
const USE_MOCK_API = true;

type Props = {
  onBack: () => void;
  onContinue?: (imageUri: string | null) => void;
  userImage?: string | null;
  roomType?: string | null;
  designType?: 'interior' | 'exterior' | 'garden' | 'replace' | 'newwalls' | 'newflooring' | 'cleanup' | 'blueprint';
  onBeforeGenerate?: () => Promise<boolean>;
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

const InteriorStyleSelectionScreen = ({ onBack, onContinue, userImage, roomType, designType = 'interior', onBeforeGenerate }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const STYLE_IMAGES = [
    'Interior (1).webp',
    'Interior (2).webp',
    'interiorslide1.webp',
    'interiorslide2.webp',
    'interior-design.webp',
    'Garden (1).webp',
    'Garden (2).webp',
    'Gardenslide1.webp',
    'Gardenslide2.webp',
    'garden-design.webp',
    'exterior-design.webp',
    'new-walls.webp'
  ];

  const { images: firebaseImagesDict, loading: loadingImages } = useFirebaseImagePaths(STYLE_IMAGES);
  
  // Safely map dictionary back to array
  const firebaseImages = STYLE_IMAGES.map(key => firebaseImagesDict[key] || null);

  // Log screen view
  useEffect(() => {
    logScreenView('InteriorStyleSelectionScreen');
  }, []);

  const stylesData = [
    { id: 'modern', name: 'Modern', image: firebaseImages[0] },
    { id: 'cozy', name: 'Cozy', image: firebaseImages[1] },
    { id: 'luxury', name: 'Luxury', image: firebaseImages[2] },
    { id: 'minimalist', name: 'Minimalist', image: firebaseImages[3] },
    { id: 'scandinavian', name: 'Scandinavian', image: firebaseImages[4] },
    { id: 'airbnb', name: 'Airbnb', image: firebaseImages[5] },
    { id: 'midcentury', name: 'Mid Century', image: firebaseImages[6] },
    { id: 'rustic', name: 'Rustic', image: firebaseImages[7] },
    { id: 'zen', name: 'Zen', image: firebaseImages[8] },
    { id: 'tropical', name: 'Tropical', image: firebaseImages[9] },
    { id: 'coastal', name: 'Coastal', image: firebaseImages[10] },
    { id: 'vintage', name: 'Vintage', image: firebaseImages[11] },
  ];


  const handleGenerate = async () => {
    logButtonClick('Generate Button', 'InteriorStyleSelectionScreen');

    // Check tokens before starting anything
    if (onBeforeGenerate) {
      const canProceed = await onBeforeGenerate();
      if (!canProceed) return;
    }

    console.log('=== Generate Button Pressed ===');
    console.log('Selected style:', selectedStyle);
    console.log('Room type:', roomType);
    console.log('Design type:', designType);
    console.log('Has user image:', !!userImage);

    // Log design generation to Analytics
    if (selectedStyle && roomType) {
      await analytics.logDesignGeneration(designType || 'interior', roomType, selectedStyle);
    }

    if (!selectedStyle || !roomType) {
      console.warn('Validation failed: Missing style or room type');
      Alert.alert('Error', 'Please select a style and room type');
      return;
    }

    // Only call API for interior, exterior, and garden
    if (designType !== 'interior' && designType !== 'exterior' && designType !== 'garden') {
      console.log('Design type does not require API call, continuing without API');
      // For other design types, just continue without API call
      onContinue?.(userImage || null);
      return;
    }

    console.log('Starting design generation...');
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

      console.log('Calling Firebase Function: design');
      // v2 functions default to us-central1 region
      const functions = getFunctions(undefined, 'us-central1');
      const designFunction = httpsCallable(functions, 'design');

      const requestData = {
        designType: designType,
        roomType: roomType,
        style: selectedStyle,
        imageBase64: imageBase64 || null,
      };

      console.log('Request payload:', {
        designType: requestData.designType,
        roomType: requestData.roomType,
        style: requestData.style,
        hasImageBase64: !!requestData.imageBase64,
        imageBase64Length: requestData.imageBase64 ? requestData.imageBase64.length : 0
      });

      let responseData: DesignResponse;

      if (USE_MOCK_API) {
        console.log('⚠️ MOCK MODE: Generating static response...');
        // Simulate network delay
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));

        // In mock mode, simply return the user's uploaded image directly without base64 conversion
        // since base64 conversion can cause memory issues on emulators.
        responseData = {
          success: true,
          message: 'Mock design generated successfully',
          hasImage: !!userImage,
          designType: requestData.designType,
          roomType: requestData.roomType,
          style: requestData.style,
          prompt: `Generate a ${requestData.style} style ${requestData.roomType} design`,
          generatedDescription: `This is a mock ${requestData.style} style ${requestData.roomType} design.`,
          imageDataUri: userImage || undefined,
          imageMimeType: 'image/jpeg',
        };
      } else {
        // Real API call - uncomment the lines below when USE_MOCK_API is false
        // const result = await designFunction(requestData);
        // responseData = result.data as DesignResponse;

        // For now, using mock even when USE_MOCK_API is false (real API is commented out)
        console.log('⚠️ Real API call commented out. Using mock response...');
        await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
        responseData = {
          success: true,
          message: 'Mock design generated successfully',
          hasImage: !!userImage,
          designType: requestData.designType,
          roomType: requestData.roomType,
          style: requestData.style,
          prompt: `Generate a ${requestData.style} style ${requestData.roomType} design`,
          generatedDescription: `This is a mock ${requestData.style} style ${requestData.roomType} design.`,
          imageDataUri: userImage || undefined,
          imageMimeType: 'image/jpeg',
        };
      }

      console.log('=== Design Generation Response ===');
      console.log('Success:', responseData.success);
      console.log('Message:', responseData.message);
      console.log('Has image:', responseData.hasImage);
      console.log('Design type:', responseData.designType);
      console.log('Room type:', responseData.roomType);
      console.log('Style:', responseData.style);
      console.log('Prompt:', responseData.prompt);
      console.log('Generated description length:', responseData.generatedDescription?.length || 0);

      if (responseData.success) {
        // Check if we got a generated image
        let generatedImageUri = null;

        if (responseData.imageDataUri) {
          // Use the data URI directly if provided
          generatedImageUri = responseData.imageDataUri;
        } else if (responseData.imageBase64) {
          // Construct data URI from base64 and mime type
          generatedImageUri = `data:${responseData.imageMimeType || 'image/png'};base64,${responseData.imageBase64}`;
        }

        if (generatedImageUri) {
          console.log('Generated image received, length:', generatedImageUri.length);
          console.log('Navigating to result screen with generated image');
          // Navigate to result screen with generated image
          onContinue?.(generatedImageUri);
        } else {
          console.log('No image in response, using user image or placeholder');
          // Fallback to user image or placeholder
          onContinue?.(userImage || null);
        }
      } else {
        console.error('Design generation failed:', responseData.message);
        Alert.alert('Error', responseData.message || 'Failed to generate design');
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error('=== Error in handleGenerate ===');
      console.error('Error type:', error?.constructor?.name || 'Unknown');
      console.error('Error message:', error?.message || 'Unknown error');
      console.error('Error code:', error?.code || 'N/A');
      console.error('Error details:', error?.details || 'N/A');
      console.error('Full error object:', JSON.stringify(error, null, 2));

      let errorMessage = 'Failed to generate design. Please try again.';

      if (error?.code === 'unavailable' || error?.code === 'functions/unavailable') {
        errorMessage = 'The design service is currently unavailable. Please make sure:\n\n1. The Firebase function is deployed\n2. You have an active internet connection\n3. Try again in a few moments';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
      setIsGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          logButtonClick('Back Button', 'InteriorStyleSelectionScreen');
          onBack();
        }} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interior Inspiration's</Text>
        <TouchableOpacity onPress={() => {
          logButtonClick('Close Button', 'InteriorStyleSelectionScreen');
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
        {loadingImages ? (
          <StyleSelectionSkeleton count={12} />
        ) : (
        <View style={styles.stylesGrid}>
          {stylesData.map((styleItem) => (
            <TouchableOpacity
              key={styleItem.id}
              style={styles.styleCard}
              onPress={() => {
                logButtonClick(`Style Selected: ${styleItem.name}`, 'InteriorStyleSelectionScreen');
                analytics.logSelectContent('style', styleItem.id, styleItem.name, {
                  design_type: designType || 'interior',
                });
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
        )}
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

export default InteriorStyleSelectionScreen;

