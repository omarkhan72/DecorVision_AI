import React from 'react';
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
import RNFS from 'react-native-fs';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

type Props = { onBack: () => void; onRegenerate?: () => void; userImage?: string | null };

const DesignResultScreen = ({ onBack, onRegenerate, userImage }: Props) => {
  const insets = useSafeAreaInsets();
  // Use the user's uploaded image or fallback to default
  const imageSource = userImage 
    ? { uri: userImage }
    : require('../assets/images/interior-design.jpg');

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
    try {
      // Request storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Storage permission is required to download images.');
        return;
      }

      // Handle user image (URI) vs bundled asset
      let sourceUri: string;
      if (userImage) {
        // User uploaded image - use the URI directly
        sourceUri = userImage;
      } else {
        // Bundled asset - resolve it
        const imageUri = Image.resolveAssetSource(imageSource);
        if (!imageUri || !imageUri.uri) {
          Alert.alert('Error', 'Unable to load image for download');
          return;
        }
        sourceUri = imageUri.uri;
      }

      // Create filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `design_${timestamp}.jpg`;
      
      // Determine download path based on platform
      let downloadPath = '';
      if (Platform.OS === 'android') {
        // For Android, save to Pictures directory
        downloadPath = `${RNFS.PicturesDirectoryPath}/${filename}`;
      } else {
        // For iOS, save to Pictures directory
        downloadPath = `${RNFS.PicturesDirectoryPath}/${filename}`;
      }
      
      // Handle different URI types
      if (sourceUri.startsWith('file://')) {
        // Direct file path - copy it
        await RNFS.copyFile(sourceUri, downloadPath);
      } else if (sourceUri.startsWith('http://') || sourceUri.startsWith('https://')) {
        // Remote URL - download it
        const downloadResult = await RNFS.downloadFile({
          fromUrl: sourceUri,
          toFile: downloadPath,
        }).promise;
        
        if (downloadResult.statusCode !== 200) {
          throw new Error('Download failed');
        }
      } else {
        // For bundled assets, try to read as base64 using react-native-fs
        try {
          // Try to read the file if it's accessible
          if (await RNFS.exists(sourceUri)) {
            const base64 = await RNFS.readFile(sourceUri, 'base64');
            await RNFS.writeFile(downloadPath, base64, 'base64');
          } else {
            // If file doesn't exist at that path, try fetching
            const response = await fetch(sourceUri);
            if (!response.ok) {
              throw new Error('Failed to fetch image');
            }
            // Use react-native-fs to download from the URI
            const downloadResult = await RNFS.downloadFile({
              fromUrl: sourceUri,
              toFile: downloadPath,
            }).promise;
            
            if (downloadResult.statusCode !== 200) {
              throw new Error('Download failed');
            }
          }
        } catch (fetchError) {
          // If we can't download, suggest using share instead
          Alert.alert(
            'Info',
            'Please use the Share button to save the image to your gallery.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      Alert.alert(
        'Success',
        `Image downloaded successfully to ${Platform.OS === 'android' ? 'Pictures' : 'Photos'} folder!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.log('Download error:', error);
      Alert.alert('Error', 'Unable to download image. Please try using the Share button instead.');
    }
  };

  const handleShare = async () => {
    try {
      let imageUriString: string;
      
      if (userImage) {
        // User uploaded image - handle different URI types
        if (userImage.startsWith('content://')) {
          // Android content:// URI - copy to temp file for sharing
          const timestamp = new Date().getTime();
          const tempFileName = `share_${timestamp}.jpg`;
          const tempFilePath = `${RNFS.CachesDirectoryPath}/${tempFileName}`;
          
          try {
            // Read the content URI and write to temp file
            const base64 = await RNFS.readFile(userImage, 'base64');
            await RNFS.writeFile(tempFilePath, base64, 'base64');
            imageUriString = `file://${tempFilePath}`;
          } catch (copyError) {
            // If reading fails, try using the URI directly
            imageUriString = userImage;
          }
        } else if (userImage.startsWith('file://')) {
          // File URI - verify it exists
          const filePath = userImage.replace('file://', '');
          const fileExists = await RNFS.exists(filePath);
          if (!fileExists) {
            Alert.alert('Error', 'Image file not found. Please try again.');
            return;
          }
          imageUriString = userImage;
        } else {
          // Direct path or other format
          imageUriString = userImage;
        }
      } else {
        // Bundled asset - we need to copy it to a temporary location for sharing
        const imageUri = Image.resolveAssetSource(imageSource);
        if (!imageUri || !imageUri.uri) {
          Alert.alert('Error', 'Unable to load image for sharing');
          return;
        }
        
        // For bundled assets, copy to a temporary file that can be shared
        const timestamp = new Date().getTime();
        const tempFileName = `temp_share_${timestamp}.jpg`;
        const tempFilePath = `${RNFS.CachesDirectoryPath}/${tempFileName}`;
        
        // Copy the bundled asset to temp location
        const sourceUri = imageUri.uri;
        if (sourceUri.startsWith('file://')) {
          await RNFS.copyFile(sourceUri, tempFilePath);
        } else {
          // If it's a bundled asset, we might need to read it differently
          // For now, try to use the original URI
          imageUriString = sourceUri;
          const shareOptions = {
            title: 'Share Design',
            message: 'Check out this amazing interior design!',
            url: imageUriString,
            type: 'image/jpeg',
          };
          await Share.open(shareOptions);
          return;
        }
        
        imageUriString = `file://${tempFilePath}`;
      }

      // Share the image file directly
      const shareOptions = {
        title: 'Share Design',
        message: 'Check out this amazing interior design!',
        url: imageUriString,
        type: 'image/jpeg',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error: any) {
      // User cancelled or error occurred
      console.log('Share error:', error);
      // Don't show error for user cancellation
      if (!error.message?.includes('User did not share') && 
          !error.message?.includes('cancel') &&
          !error.message?.includes('User did not')) {
        Alert.alert('Error', 'Unable to share image. Please try again.');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.proButton}>
          <FontAwesome name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
          <Text style={styles.proButtonText}>Pro</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your design</Text>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Main Image Display */}
        <View style={styles.imageContainer}>
          <Image
            source={imageSource}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Feedback and Watermark Removal */}
        <View style={styles.feedbackBar}>
          <View style={styles.feedbackIcons}>
            <TouchableOpacity style={styles.feedbackButton}>
              <FontAwesome name="thumbs-up" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackButton}>
              <FontAwesome name="thumbs-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.removeWatermarkButton}>
            <Text style={styles.removeWatermarkText}>Remove watermark</Text>
          </TouchableOpacity>
        </View>

        {/* Regenerate Button */}
        <TouchableOpacity 
          style={styles.regenerateButton} 
          activeOpacity={0.9}
          onPress={onRegenerate}>
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

