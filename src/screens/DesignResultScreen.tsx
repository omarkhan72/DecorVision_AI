import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

type Props = { onBack: () => void };

const DesignResultScreen = ({ onBack }: Props) => {
  const insets = useSafeAreaInsets();
  const imageSource = require('../assets/images/interior-design.jpg');

  const handleShare = async () => {
    try {
      const imageUri = Image.resolveAssetSource(imageSource);
      
      if (!imageUri || !imageUri.uri) {
        Alert.alert('Error', 'Unable to load image for sharing');
        return;
      }

      const shareOptions = {
        title: 'Share Design',
        message: 'Check out this amazing interior design!',
        url: imageUri.uri,
        type: 'image/jpeg',
      };

      await Share.open(shareOptions);
    } catch (error: any) {
      // User cancelled or error occurred
      console.log('Share error:', error);
      // Don't show error for user cancellation
      if (!error.message?.includes('User did not share') && !error.message?.includes('cancel')) {
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
        <TouchableOpacity style={styles.regenerateButton} activeOpacity={0.9}>
          <View style={styles.regenerateGradient}>
            <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.regenerateText}>Regenerate</Text>
          </View>
        </TouchableOpacity>

        {/* Download and Share Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.downloadButton} activeOpacity={0.9}>
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

