import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

type Props = { onBack: () => void };

const DesignResultScreen = ({ onBack }: Props) => {
  const insets = useSafeAreaInsets();

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Image Editing Controls */}
        <View style={styles.controlsBar}>
          <TouchableOpacity style={styles.controlButton}>
            <MaterialCommunityIcons name="camera-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <MaterialCommunityIcons name="delete-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Main Image Display */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/interior-design.jpg')}
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
      </ScrollView>

      {/* Footer with Social Media Icons */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.socialButton}>
          <View style={[styles.socialIconContainer, styles.downloadIcon]}>
            <FontAwesome name="download" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <View style={[styles.socialIconContainer, styles.tiktokIcon]}>
            <FontAwesome5 name="music" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <View style={[styles.socialIconContainer, styles.instagramIcon]}>
            <MaterialCommunityIcons name="camera-outline" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <View style={[styles.socialIconContainer, styles.facebookIcon]}>
            <FontAwesome5 name="facebook" size={18} color="#FFFFFF" />
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
    paddingBottom: 100,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    backgroundColor: '#F3F4F6',
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
    marginBottom: 20,
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadIcon: {
    backgroundColor: '#8B5CF6',
  },
  tiktokIcon: {
    backgroundColor: '#000000',
  },
  instagramIcon: {
    backgroundColor: '#E1306C',
  },
  facebookIcon: {
    backgroundColor: '#1877F2',
  },
});

export default DesignResultScreen;

