import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const images = [
    require('../assets/images/interior-design.jpg'),
    require('../assets/images/garden-design.jpg'),
    require('../assets/images/exterior-design.jpg'),
    require('../assets/images/new-walls.jpg'),
  ];

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title row with Select pill */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>History</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={[styles.selectPill, isSelecting && styles.selectPillActive]} onPress={() => setIsSelecting(!isSelecting)}>
            <Text style={[styles.selectText, isSelecting && styles.selectTextActive]}>Select</Text>
          </TouchableOpacity>
        </View>

        {/* Card container with image grid */}
        <View style={styles.card}>
          <View style={styles.gridRow}>
            {images.map((src, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.gridItem}
                activeOpacity={0.9}
                onPress={() => setSelectedImage(src)}>
                <Image source={src} style={styles.gridImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
              activeOpacity={0.8}>
              <FontAwesome name="times" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.imageContainer}>
            {selectedImage && (
              <Image source={selectedImage} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 140,
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6D4DF6',
  },
  selectPill: {
    backgroundColor: '#ECEBFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectPillActive: {
    backgroundColor: '#6D4DF6',
  },
  selectText: {
    color: '#6D4DF6',
    fontWeight: '700',
    fontSize: 12,
  },
  selectTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});

export default HistoryScreen;


