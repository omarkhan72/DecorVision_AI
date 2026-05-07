import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

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
        images={[
          require('../assets/images/exterior-design.webp'),
          require('../assets/images/new-walls.webp'),
          require('../assets/images/new-flooring.webp'),
        ]}
        onImagePress={onImagePress}
      />
      <Section
        title="Office"
        images={[
          require('../assets/images/exterior-design.webp'),
          require('../assets/images/interior-design.webp'),
          require('../assets/images/replace.webp'),
        ]}
        onImagePress={onImagePress}
      />
      <Section
        title="Yard"
        images={[
          require('../assets/images/garden-design.webp'),
          require('../assets/images/exterior-design.webp'),
          require('../assets/images/new-walls.webp'),
        ]}
        onImagePress={onImagePress}
      />
      <Section
        title="Swimming pool"
        images={[
          require('../assets/images/garden-design.webp'),
          require('../assets/images/new-flooring.webp'),
          require('../assets/images/exterior-design.webp'),
        ]}
        onImagePress={onImagePress}
      />
      <Section
        title="Villa"
        images={[
          require('../assets/images/exterior-design.webp'),
          require('../assets/images/garden-design.webp'),
          require('../assets/images/exterior-design.webp'),
        ]}
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


