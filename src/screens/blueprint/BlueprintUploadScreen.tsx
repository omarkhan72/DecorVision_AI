import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { logScreenView, logButtonClick } from '../../utils/crashlytics';
import * as analytics from '../../utils/analytics';

type Props = {
  onBack: () => void;
  onContinue: (imageUri: string) => void;
  styleImage?: any;
};

const BlueprintUploadScreen = ({ onBack, onContinue }: Props) => {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPickerModal, setShowPickerModal] = useState(false);

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
    if (response.didCancel) return;
    if (response.errorMessage) {
      if (response.errorMessage.toLowerCase().includes('activity error')) {
        Alert.alert('App Reload Required', 'The app lost connection to the Android Activity. Please reload the app.');
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

  const handleChooseFromGallery = () => {
    setShowPickerModal(false);
    logButtonClick('Upload Blueprint Button', 'BlueprintUploadScreen');
    analytics.logImageUpload('gallery', 'blueprint' as any);
    setTimeout(() => {
      launchImageLibrary(
        { mediaType: 'photo' as MediaType, quality: 0.8, selectionLimit: 1 },
        handleImageResponse
      );
    }, 300);
  };

  const handleTakePhoto = async () => {
    setShowPickerModal(false);
    logButtonClick('Take Blueprint Photo Button', 'BlueprintUploadScreen');
    analytics.logImageUpload('camera', 'blueprint' as any);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }
    setTimeout(() => {
      launchCamera(
        { mediaType: 'photo' as MediaType, quality: 0.8 },
        handleImageResponse
      );
    }, 300);
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
          <FontAwesome name="times" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Step tag */}
      <View style={styles.stepRow}>
        <View style={styles.stepTag}>
          <Text style={styles.stepText}>Floor Plan to 3D</Text>
        </View>
      </View>

      {/* Instruction */}
      <Text style={styles.instructionText}>
        Upload your 2D Floor Plan{'\n'}or Blueprint
      </Text>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {selectedImage ? (
          /* Image Preview */
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
                setShowPickerModal(true);
              }}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Single Upload Blueprint Card */
          <TouchableOpacity
            style={styles.uploadCard}
            activeOpacity={0.88}
            onPress={() => setShowPickerModal(true)}>
            {/* Top accent bar */}
            <View style={styles.cardAccentBar} />

            <View style={styles.uploadCardInner}>
              {/* Icon */}
              <View style={styles.uploadIconWrap}>
                <MaterialCommunityIcons name="floor-plan" size={72} color="#8B5CF6" />
              </View>

              {/* Text */}
              <Text style={styles.uploadCardTitle}>Upload Blueprint</Text>
              <Text style={styles.uploadCardSubtitle}>
                Tap to choose from your gallery or capture with your camera
              </Text>

              {/* Tap hint pill */}
              <View style={styles.tapHint}>
                <FontAwesome name="plus" size={12} color="#8B5CF6" />
                <Text style={styles.tapHintText}>Add Blueprint</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            logButtonClick('Continue Button', 'BlueprintUploadScreen');
            if (selectedImage) onContinue(selectedImage);
          }}
          activeOpacity={0.9}
          disabled={!selectedImage}>
          <View style={[styles.gradient, !selectedImage && styles.gradientDisabled]}>
            <Text style={styles.continueButtonText}>generate 3d render</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Picker Bottom Sheet Modal */}
      <Modal
        visible={showPickerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPickerModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPickerModal(false)}>
          <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Handle bar */}
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Add Blueprint</Text>
            <Text style={styles.sheetSubtitle}>Choose how you'd like to add your floor plan</Text>

            {/* Gallery option */}
            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.85}
              onPress={handleChooseFromGallery}>
              <View style={styles.sheetOptionIcon}>
                <MaterialCommunityIcons name="image-multiple-outline" size={28} color="#8B5CF6" />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={styles.sheetOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.sheetOptionSub}>Pick an existing photo or file</Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color="#C4B5FD" />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.sheetDivider} />

            {/* Camera option */}
            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.85}
              onPress={handleTakePhoto}>
              <View style={[styles.sheetOptionIcon, styles.sheetOptionIconDark]}>
                <MaterialCommunityIcons name="camera-outline" size={28} color="#1A1A1A" />
              </View>
              <View style={styles.sheetOptionText}>
                <Text style={[styles.sheetOptionTitle, styles.sheetOptionTitleDark]}>Take Photo</Text>
                <Text style={styles.sheetOptionSub}>Capture your blueprint with the camera</Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowPickerModal(false)}
              activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  stepRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  stepTag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  instructionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  /* ── Upload Card ── */
  uploadCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  cardAccentBar: {
    height: 5,
    backgroundColor: '#8B5CF6',
    width: '100%',
  },
  uploadCardInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  uploadIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadCardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  uploadCardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A78BFA',
    textAlign: 'center',
    lineHeight: 20,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tapHintText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  /* ── Preview ── */
  previewContainer: {
    flex: 1,
    borderRadius: 20,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    marginLeft: -70,
    backgroundColor: 'rgba(139,92,246,0.9)',
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
  /* ── Footer ── */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  gradient: {
    paddingVertical: 17,
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
    letterSpacing: 0.3,
  },
  /* ── Bottom Sheet Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 24,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  sheetOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionIconDark: {
    backgroundColor: '#F3F4F6',
  },
  sheetOptionText: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 2,
  },
  sheetOptionTitleDark: {
    color: '#1A1A1A',
  },
  sheetOptionSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  cancelBtn: {
    marginTop: 16,
    marginBottom: 4,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default BlueprintUploadScreen;
