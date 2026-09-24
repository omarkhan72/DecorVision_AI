import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getHistory, deleteFromHistory, HistoryItem } from '../../utils/historyStorage';
import { logScreenView, logButtonClick } from '../../utils/crashlytics';
import * as analytics from '../../utils/analytics';

const HistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Log screen view and load history on mount
  useEffect(() => {
    logScreenView('HistoryScreen');
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const history = await getHistory();
    setHistoryItems(history);
  };

  const handleImagePress = (item: HistoryItem, index: number) => {
    if (isSelecting) {
      // Toggle selection
      if (selectedIndices.includes(index)) {
        setSelectedIndices(selectedIndices.filter(i => i !== index));
      } else {
        setSelectedIndices([...selectedIndices, index]);
      }
    } else {
      // Show full screen image
      setSelectedImage(item.imageUri);
    }
  };

  const handleSelectToggle = () => {
    setIsSelecting(!isSelecting);
    if (isSelecting) {
      setSelectedIndices([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIndices.length === 0) return;

    Alert.alert(
      'Delete Images',
      `Are you sure you want to delete ${selectedIndices.length} image(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const idsToDelete = selectedIndices.map(index => historyItems[index].id);
            await deleteFromHistory(idsToDelete);
            await loadHistory();
            setSelectedIndices([]);
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title row with Select pill */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>History</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={[styles.selectPill, isSelecting && styles.selectPillActive]} onPress={() => {
            logButtonClick('Select Toggle', 'HistoryScreen');
            handleSelectToggle();
          }}>
            <Text style={[styles.selectText, isSelecting && styles.selectTextActive]}>Select</Text>
          </TouchableOpacity>
        </View>

        {/* Card container with image grid */}
        <View style={styles.card}>
          {historyItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No designs yet</Text>
              <Text style={styles.emptySubtext}>Your generated designs will appear here</Text>
            </View>
          ) : (
            <View style={styles.gridRow}>
              {historyItems.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridItem}
                  activeOpacity={0.9}
                  onPress={() => {
                    logButtonClick('History Image Press', 'HistoryScreen');
                    analytics.logSelectContent('history_item', item.id, 'History Image');
                    handleImagePress(item, idx);
                  }}>
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: item.imageUri }} style={styles.gridImage} />
                    {isSelecting && selectedIndices.includes(idx) && (
                      <>
                        <View style={styles.selectedOverlay} />
                        <View style={styles.checkbox}>
                          <FontAwesome name="check" size={16} color="#FFFFFF" />
                        </View>
                      </>
                    )}
                    {isSelecting && !selectedIndices.includes(idx) && (
                      <View style={styles.unselectedBorder} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Delete button when selecting */}
        {isSelecting && selectedIndices.length > 0 && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => {
            logButtonClick('Delete Selected', 'HistoryScreen');
            analytics.logEvent('delete_history_items', { count: selectedIndices.length });
            handleDeleteSelected();
          }}>
            <Text style={styles.deleteButtonText}>Delete ({selectedIndices.length})</Text>
          </TouchableOpacity>
        )}
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
              <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unselectedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
  },
  deleteButton: {
    marginTop: 16,
    marginHorizontal: 12,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HistoryScreen;


