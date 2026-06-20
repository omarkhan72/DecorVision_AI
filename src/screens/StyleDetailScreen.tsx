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
import { useFirebaseImagePaths } from '../hooks/useFirebaseImagePaths';

const STYLE_DETAIL_IMAGES = ['interior-design.webp'];

type Props = { onBack: () => void; onTryStyle?: () => void; roomName?: string; image?: any };

const StyleDetailScreen = ({ onBack, onTryStyle, roomName = 'Living Room', image }: Props) => {
  const insets = useSafeAreaInsets();
  const { images } = useFirebaseImagePaths(STYLE_DETAIL_IMAGES);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>

        <Text style={styles.headerTitle}>Your design</Text>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {/* Main Image Display */}
        <View style={styles.imageContainer}>
          <Image
            source={image || images['interior-design.webp'] || { uri: '' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {/* Expand/Move Icon */}
          <TouchableOpacity style={styles.expandButton}>
            <MaterialCommunityIcons name="arrow-all" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Room Label */}
        <View style={styles.roomLabelContainer}>
          <Text style={styles.roomLabel}>Room: {roomName}</Text>
        </View>

        {/* Try This Style Button */}
        <TouchableOpacity
          style={styles.tryStyleButton}
          activeOpacity={0.9}
          onPress={onTryStyle}>
          <View style={styles.tryStyleGradient}>
            <Text style={styles.tryStyleText}>Try This style</Text>
          </View>
        </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: '#FFFFFF',
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
    marginTop: 12,
    marginBottom: 0,
    position: 'relative',
    paddingHorizontal: 0,
  },
  mainImage: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 0,
  },
  expandButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'rgba(107, 114, 128, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomLabelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  roomLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tryStyleButton: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tryStyleGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
  },
  tryStyleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default StyleDetailScreen;

