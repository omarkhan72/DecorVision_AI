import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { logScreenView, logButtonClick } from '../utils/crashlytics';
import * as analytics from '../utils/analytics';

type Props = { onBack: () => void; onContinue?: (imageUri: string | null) => void; styleImage?: any };

const ReplaceUploadScreen = ({ onBack, onContinue, styleImage }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Log screen view
  useEffect(() => {
    logScreenView('ReplaceUploadScreen');
  }, []);

  // If styleImage is provided, add it as the first sample image
  const sampleImages = styleImage
    ? [
        styleImage,
        require('../assets/images/replace.jpg'),
        require('../assets/images/replace.jpg'),
        require('../assets/images/replace.jpg'),
      ]
    : [
        require('../assets/images/replace.jpg'),
        require('../assets/images/replace.jpg'),
        require('../assets/images/replace.jpg'),
        require('../assets/images/replace.jpg'),
      ];

  // Request camera permissions for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Handle image picker response
  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorMessage) {
      Alert.alert('Error', response.errorMessage);
      return;
    }
    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      // Prefer base64 if available, otherwise use URI
      let imageData: string | null = null;
      if (asset.base64) {
        const mimeType = asset.type || 'image/jpeg';
        imageData = `data:${mimeType};base64,${asset.base64}`;
      } else if (asset.uri) {
        imageData = asset.uri;
      }
      setSelectedImage(imageData);
    }
  };

  // Upload photo from gallery
  const handleUploadPhoto = () => {
    logButtonClick('Upload Photo Button', 'ReplaceUploadScreen');
    analytics.logImageUpload('gallery', 'replace');
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        selectionLimit: 1,
        includeBase64: true,
      },
      handleImageResponse
    );
  };

  // Take photo with camera
  const handleTakePhoto = async () => {
    logButtonClick('Take Photo Button', 'ReplaceUploadScreen');
    analytics.logImageUpload('camera', 'replace');
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        saveToPhotos: true,
        includeBase64: true,
      },
      handleImageResponse
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.proButton}>
          <FontAwesome name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
          <Text style={styles.proButtonText}>Pro</Text>
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
            <Text style={styles.stepText}>Step 1/3</Text>
          </View>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Instruction Text */}
        <Text style={styles.instructionText}>Upload a photo of the area you want to replace</Text>

        {/* Selected Image Preview */}
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                logButtonClick('Remove Image Button', 'ReplaceUploadScreen');
                setSelectedImage(null);
              }}>
              <FontAwesome name="times" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => {
                logButtonClick('Change Photo Button', 'ReplaceUploadScreen');
                setSelectedImage(null);
              }}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Upload and Take Photo Buttons */
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.uploadButton}
              activeOpacity={0.9}
              onPress={handleUploadPhoto}>
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <MaterialCommunityIcons name="cloud-upload-outline" size={40} color="#000000" />
                </View>
                <Text style={styles.buttonText}>upload photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.takePhotoButton}
              activeOpacity={0.9}
              onPress={handleTakePhoto}>
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <MaterialCommunityIcons name="camera-outline" size={40} color="#000000" />
                </View>
                <Text style={styles.buttonText}>Take photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Sample Images Grid */}
        <View style={styles.samplesContainer}>
          <View style={styles.gridRow}>
            {sampleImages.map((image, index) => (
              <View key={index} style={styles.sampleImageContainer}>
                <Image source={image} style={styles.sampleImage} />
                <View style={styles.sampleOverlay}>
                  <Text style={styles.sampleText}>
                    {styleImage && index === 0 ? 'Your Style' : 'Sample'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            logButtonClick('Continue Button', 'ReplaceUploadScreen');
            onContinue?.(selectedImage);
          }}
          activeOpacity={0.9}
          disabled={!selectedImage}>
          <View style={[styles.gradient, !selectedImage && styles.gradientDisabled]}>
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
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    marginLeft: -70,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    width: 140,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  takePhotoButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconContainer: {
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'lowercase',
  },
  samplesContainer: {
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sampleImageContainer: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  sampleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sampleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(156, 163, 175, 0.75)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  sampleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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

export default ReplaceUploadScreen;

