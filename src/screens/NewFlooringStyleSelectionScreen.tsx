import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getFunctions, httpsCallable } from '@react-native-firebase/functions';

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

const NewFlooringStyleSelectionScreen = ({ onBack, onContinue, userImage, roomType }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Convert image URI to base64
  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
      console.log('Converting image to base64, URI:', uri.substring(0, 50) + '...');
      
      // If already base64, return as is
      if (uri.startsWith('data:')) {
        console.log('Image is already base64 encoded');
        return uri;
      }
      
      // Use XMLHttpRequest for file:// URIs (works in React Native)
      if (uri.startsWith('file://') || uri.startsWith('content://')) {
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', uri, true);
          xhr.responseType = 'blob';
          xhr.onload = function() {
            if (xhr.status === 200) {
              const reader = new FileReader();
              reader.onloadend = function() {
                const base64String = reader.result as string;
                console.log('Image converted to base64 via XMLHttpRequest, length:', base64String.length);
                resolve(base64String);
              };
              reader.onerror = function() {
                console.warn('FileReader error, returning URI as-is');
                resolve(uri);
              };
              reader.readAsDataURL(xhr.response);
            } else {
              console.warn('XMLHttpRequest failed, returning URI as-is');
              resolve(uri);
            }
          };
          xhr.onerror = function() {
            console.warn('XMLHttpRequest error, returning URI as-is');
            resolve(uri);
          };
          xhr.send();
        });
      }
      
      // Use fetch API for http/https URIs
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        // Convert blob to base64 using arrayBuffer (chunked for large images)
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binary);
        const mimeType = blob.type || 'image/jpeg';
        const base64DataUri = `data:${mimeType};base64,${base64}`;
        console.log('Image converted to base64, length:', base64DataUri.length);
        return base64DataUri;
      } catch (fetchError) {
        console.warn('Error converting image with fetch, returning URI as-is:', fetchError);
        // Fallback: return the URI as-is and let backend handle it
        return uri;
      }
    } catch (error: any) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Map style to flooring material prompt
  const getFlooringPrompt = (style: string): string => {
    const stylePrompts: { [key: string]: string } = {
      'modern': 'modern sleek flooring, such as polished concrete or minimalist tiles',
      'cozy': 'warm cozy flooring, such as hardwood or soft carpet',
      'luxury': 'luxurious premium flooring, such as marble or high-end hardwood',
      'minimalist': 'minimalist clean flooring, such as light wood or simple tiles',
      'scandinavian': 'scandinavian style light wood flooring',
      'airbnb': 'stylish and welcoming flooring suitable for a rental property',
      'midcentury': 'mid-century modern style flooring with retro patterns',
      'rustic': 'rustic natural flooring, such as reclaimed wood or stone',
      'zen': 'zen-inspired natural flooring, such as bamboo or light wood',
      'tropical': 'tropical style flooring with natural textures',
      'coastal': 'coastal style light flooring, such as whitewashed wood or light tiles',
      'vintage': 'vintage style classic flooring with traditional patterns',
    };
    return stylePrompts[style] || `${style} style flooring`;
  };

  const handleGenerate = async () => {
    console.log('=== Generate Button Pressed (New Flooring) ===');
    console.log('Selected style:', selectedStyle);
    console.log('Room type:', roomType);
    console.log('Design type: newflooring');
    console.log('Has user image:', !!userImage);

    if (!selectedStyle) {
      console.warn('Validation failed: Missing style');
      Alert.alert('Error', 'Please select a style');
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

      // Generate prompt from style
      const prompt = getFlooringPrompt(selectedStyle);
      console.log('Generated prompt:', prompt);

      console.log('Calling Firebase Function: newFlooringWalls');
      // v2 functions default to us-central1 region
      const functions = getFunctions(undefined, 'us-central1');
      const newFlooringWallsFunction = httpsCallable(functions, 'newFlooringWalls');
      
      const requestData = {
        imageBase64: imageBase64 || null,
        prompt: prompt,
        targetArea: 'flooring',
      };
      
      console.log('Request payload:', {
        hasImageBase64: !!requestData.imageBase64,
        prompt: requestData.prompt,
        targetArea: requestData.targetArea,
        imageBase64Length: requestData.imageBase64 ? requestData.imageBase64.length : 0
      });

      const result = await newFlooringWallsFunction(requestData);
      const responseData = result.data as any;

      console.log('=== Flooring Generation Response ===');
      console.log('Success:', responseData.success);
      console.log('Message:', responseData.message);
      console.log('Has image:', responseData.hasImage);
      console.log('Target area:', responseData.targetArea);

      if (responseData.success && responseData.hasImage) {
        // Check if we got a generated image
        let generatedImageUri = null;
        
        if (responseData.imageDataUri) {
          // Use the data URI directly if provided
          generatedImageUri = responseData.imageDataUri;
        } else if (responseData.generatedImageBase64) {
          // Construct data URI from base64 and mime type
          generatedImageUri = `data:${responseData.imageMimeType || 'image/png'};base64,${responseData.generatedImageBase64}`;
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
        console.error('Flooring generation failed:', responseData.message);
        Alert.alert('Error', responseData.message || 'Failed to generate flooring design');
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
        errorMessage = 'The flooring service is currently unavailable. Please make sure:\n\n1. The Firebase function is deployed\n2. You have an active internet connection\n3. Try again in a few moments';
      } else if (error?.code === 'internal') {
        errorMessage = 'An internal error occurred. Please make sure:\n\n1. The newFlooringWalls function is deployed\n2. The GEMINI_API_KEY is configured\n3. Try again in a few moments';
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
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Flooring Inspiration's</Text>
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

export default NewFlooringStyleSelectionScreen;

