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

type Props = {
  onBack: () => void;
  onContinue: (imageUri: string) => void;
  styleImage?: any;
};

const BlueprintUploadScreen = ({ onBack, onContinue }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    logScreenView('BlueprintUploadScreen');
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to capture blueprints',
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

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }
    if (response.errorMessage) {
      if (response.errorMessage.toLowerCase().includes('activity error')) {
        Alert.alert(
          'App Reload Required',
          'The app lost connection to the Android Activity. Please reload the app.'
        );
      } else {
        Alert.alert('Error', response.errorMessage);
      }
      return;
    }
    if (response.assets && response.assets[0]?.uri) {
      setSelectedImage(response.assets[0].uri);
    } else {
      Alert.alert('Error', 'Could not retrieve image. Please try again.');
    }
  };

  const handleUploadPhoto = () => {
    logButtonClick('Upload Blueprint Button', 'BlueprintUploadScreen');
    analytics.logImageUpload('gallery', 'blueprint' as any);
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        selectionLimit: 1,
      },
      handleImageResponse
    );
  };

  const handleTakePhoto = async () => {
    logButtonClick('Take Blueprint Photo Button', 'BlueprintUploadScreen');
    analytics.logImageUpload('camera', 'blueprint' as any);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
      },
      handleImageResponse
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>3D Design Maker</Text>
        <TouchableOpacity
          onPress={() => {
            logButtonClick('Close Button', 'BlueprintUploadScreen');
            onBack();
          }}
          style={styles.closeButton}>
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
            <Text style={styles.stepText}>Floor Plan to 3D</Text>
          </View>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        {/* Instruction Text */}
        <Text style={styles.instructionText}>Upload your 2D Floor Plan / Blueprint</Text>

        {/* Selected Image Preview */}
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => {
                logButtonClick('Remove Image Button', 'BlueprintUploadScreen');
                setSelectedImage(null);
              }}>
              <FontAwesome name="times" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={() => {
                logButtonClick('Change Photo Button', 'BlueprintUploadScreen');
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
                  <MaterialCommunityIcons name="floor-plan" size={40} color="#8B5CF6" />
                </View>
                <Text style={styles.buttonText}>upload blueprint</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.takePhotoButton}
              activeOpacity={0.9}
              onPress={handleTakePhoto}>
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <MaterialCommunityIcons name="camera-outline" size={40} color="#1A1A1A" />
                </View>
                <Text style={styles.buttonText}>take photo</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            logButtonClick('Continue Button', 'BlueprintUploadScreen');
            if (selectedImage) {
              onContinue(selectedImage);
            }
          }}
          activeOpacity={0.9}
          disabled={!selectedImage}>
          <View style={[styles.gradient, !selectedImage && styles.gradientDisabled]}>
            <Text style={styles.continueButtonText}>generate 3d render</Text>
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
    marginBottom: 20,
  },
  stepTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
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
    width: 20,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
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
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'lowercase',
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

export default BlueprintUploadScreen;
