import React, { useEffect } from 'react';
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
import Share from 'react-native-share';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import { saveToHistory } from '../../utils/historyStorage';
import { logScreenView, logButtonClick } from '../../utils/crashlytics';
import * as analytics from '../../utils/analytics';
import { useAuth } from '../../contexts/AuthContext';
import { useFirebaseImagePaths } from '../../hooks/useFirebaseImagePaths';
import FirebaseImage from '../../components/FirebaseImage';

const IMAGES = ['interior-design.webp'];

type Props = { onBack: () => void; onRegenerate?: () => void; userImage?: string | null };

const DesignResultScreen = ({ onBack, onRegenerate, userImage }: Props) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { images } = useFirebaseImagePaths(IMAGES);
  
  // Use the user's uploaded image or fallback to default
  const imageSource = userImage
    ? { uri: userImage }
    : images['interior-design.webp'] || { uri: '' };

  // Log screen view and save to history when screen loads
  useEffect(() => {
    logScreenView('DesignResultScreen');
    if (userImage) {
      saveToHistory(userImage);
    }
  }, [userImage]);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android 13+ (API 33+), use READ_MEDIA_IMAGES
        if (Platform.Version >= 33) {
          const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          return result === RESULTS.GRANTED;
        } else {
          // For older Android versions
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to storage to download images',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    // iOS permissions are handled automatically by the system
    return true;
  };

  const handleDownload = async () => {
    logButtonClick('Download Button', 'DesignResultScreen');
    await analytics.logDownload('design_result');
    try {
      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download images.');
        return;
      }

      // For download, we'll use the share dialog which allows saving to gallery
      // This works better across platforms than trying to save directly
      await handleShare();
    } catch (error: any) {
      console.log('Download error:', error);
      Alert.alert('Error', 'Unable to download image. Please try using the Share button instead.');
    }
  };

  const handleShare = async () => {
    logButtonClick('Share Button', 'DesignResultScreen');
    await analytics.logShare('design_result');
    try {
      let imageUriString: string;
      let tempFilePath: string | null = null;

      if (userImage) {
        // Check if it's a base64 data URI
        if (userImage.startsWith('data:image/')) {
          try {
            // Extract base64 data and mime type
            const matches = userImage.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const mimeType = matches[1];
              const base64Data = matches[2];

              // Determine file extension from mime type
              let extension = 'jpg';
              if (mimeType.includes('png')) extension = 'png';
              else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
              else if (mimeType.includes('webp')) extension = 'webp';

              // Create temporary file path
              const fileName = `design_${Date.now()}.${extension}`;
              tempFilePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

              // Write base64 data to file
              await RNFS.writeFile(tempFilePath, base64Data, 'base64');
              console.log('Temporary file created:', tempFilePath);

              // Use the file URI for sharing
              // react-native-share works with file:// prefix on both platforms
              imageUriString = `file://${tempFilePath}`;
            } else {
              // Fallback: try to use data URI directly
              imageUriString = userImage;
            }
          } catch (fileError: any) {
            console.error('Error creating temporary file:', fileError);
            // Fallback: try to use data URI directly
            imageUriString = userImage;
          }
        } else {
          // Regular file URI - use directly
          imageUriString = userImage;
        }
      } else {
        // Bundled asset - resolve it
        const imageUri = Image.resolveAssetSource(imageSource);
        if (!imageUri || !imageUri.uri) {
          Alert.alert('Error', 'Unable to load image for sharing');
          return;
        }
        imageUriString = imageUri.uri;
      }

      // Share the image file
      const shareOptions = {
        title: 'Share Design',
        message: 'Check out this amazing design!',
        url: imageUriString,
        type: 'image/jpeg',
        failOnCancel: false,
      };

      await Share.open(shareOptions);

      // Clean up temporary file after sharing (optional - can be kept for user to access)
      // Uncomment the following lines if you want to delete the temp file immediately
      // if (tempFilePath) {
      //   try {
      //     await RNFS.unlink(tempFilePath);
      //     console.log('Temporary file deleted');
      //   } catch (unlinkError) {
      //     console.warn('Error deleting temporary file:', unlinkError);
      //   }
      // }
    } catch (error: any) {
      // User cancelled or error occurred
      console.log('Share error:', error);
      // Don't show error for user cancellation
      if (!error.message?.includes('User did not share') &&
        !error.message?.includes('cancel') &&
        !error.message?.includes('User did not') &&
        !error.message?.includes('User cancelled')) {
        Alert.alert('Error', 'Unable to share image. Please try again.');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Text style={styles.headerTitle}>Your design</Text>
        <TouchableOpacity onPress={() => {
          logButtonClick('Close Button', 'DesignResultScreen');
          onBack();
        }} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Main Image Display */}
        <View style={styles.imageContainer}>
          <FirebaseImage
            source={imageSource}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Feedback and Watermark Removal */}
        <View style={styles.feedbackBar}>
          <View style={styles.feedbackIcons}>
            <TouchableOpacity style={styles.feedbackButton} onPress={() => logButtonClick('Thumbs Up Button', 'DesignResultScreen')}>
              <FontAwesome name="thumbs-up" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackButton} onPress={() => logButtonClick('Thumbs Down Button', 'DesignResultScreen')}>
              <FontAwesome name="thumbs-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.removeWatermarkButton} onPress={() => logButtonClick('Remove Watermark Button', 'DesignResultScreen')}>
            <Text style={styles.removeWatermarkText}>Remove watermark</Text>
          </TouchableOpacity>
        </View>

        {/* Regenerate Button */}
        <TouchableOpacity
          style={styles.regenerateButton}
          activeOpacity={0.9}
          onPress={() => {
            logButtonClick('Regenerate Button', 'DesignResultScreen');
            onRegenerate?.();
          }}>
          <View style={styles.regenerateGradient}>
            <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.regenerateText}>Regenerate</Text>
          </View>
        </TouchableOpacity>

        {/* Download and Share Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.downloadButton} activeOpacity={0.9} onPress={handleDownload}>
            <FontAwesome name="download" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.9} onPress={handleShare}>
            <MaterialCommunityIcons name="share-variant" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: '#F3F4F6',
    marginTop: 12,
    marginBottom: 12,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  feedbackBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  feedbackIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    padding: 4,
  },
  removeWatermarkButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  removeWatermarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  regenerateButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  regenerateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#8B5CF6',
  },
  regenerateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DesignResultScreen;

