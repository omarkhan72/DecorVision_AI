import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useFirebaseImagePaths } from '../hooks/useFirebaseImagePaths';

type Props = { onBack: () => void; onImagePress?: (image: any, roomName: string) => void };

const ThumbRow = ({ images, onImagePress, roomName }: { images: any[]; onImagePress?: (image: any, roomName: string) => void; roomName: string }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
    {images.map((img, idx) => (
      <TouchableOpacity
        key={idx}
        style={styles.thumbBox}
        activeOpacity={0.9}
        onPress={() => onImagePress?.(img, roomName)}>
        <Image source={img} style={styles.thumb} />
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const Section = ({ title, images, onImagePress }: { title: string; images: any[]; onImagePress?: (image: any, roomName: string) => void }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ThumbRow images={images} onImagePress={onImagePress} roomName={title} />
  </View>
);

const ExteriorsListScreen = ({ onBack, onImagePress }: Props) => {
  const EXTERIOR_IMAGES = [
    'exterior  (1).webp',
    'exterior  (2).webp',
    'Exteriorslide1 (1).webp',
    'Exteriorslide2.webp',
    'exterior-design.webp',
    'Garden (1).webp',
    'Garden (2).webp',
    'Gardenslide1.webp',
    'Gardenslide2.webp',
    'garden-design.webp',
    'Interior (1).webp',
    'Interior (2).webp',
    'interior-design.webp',
    'new-walls.webp',
    'new-flooring.webp'
  ];

  const { images: firebaseImagesDict, loading } = useFirebaseImagePaths(EXTERIOR_IMAGES);
  
  // Safely map dictionary back to array
  const firebaseImages = EXTERIOR_IMAGES.map(key => firebaseImagesDict[key] || null).filter(Boolean);

  if (loading) {
    return (
      <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const getImagesForSection = (startIndex: number) => {
    return firebaseImages.slice(startIndex, startIndex + 3);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <FontAwesome name="angle-left" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Exterior Inspiration's</Text>
        <View style={{ width: 22 }} />
      </View>

      <Section
        title="Home"
        images={getImagesForSection(0)}
        onImagePress={onImagePress}
      />
      <Section
        title="Office"
        images={getImagesForSection(3)}
        onImagePress={onImagePress}
      />
      <Section
        title="Yard"
        images={getImagesForSection(6)}
        onImagePress={onImagePress}
      />
      <Section
        title="Swimming pool"
        images={getImagesForSection(9)}
        onImagePress={onImagePress}
      />
      <Section
        title="Villa"
        images={getImagesForSection(12)}
        onImagePress={onImagePress}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F8FB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  thumbRow: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  thumbBox: {
    width: 120,
    aspectRatio: 1.35,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default ExteriorsListScreen;


