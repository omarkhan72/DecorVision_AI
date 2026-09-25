import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const HISTORY_KEY = '@design_history';

export interface HistoryItem {
  id: string;
  imageUri: string;
  createdAt: number;
}

export const saveToHistory = async (imageUri: string): Promise<void> => {
  try {
    let persistentUri = imageUri;

    // If imageUri is a base64 data URI, write it to disk as a file to prevent SQLite CursorWindow 2MB overflow
    if (imageUri && imageUri.startsWith('data:')) {
      try {
        const matches = imageUri.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        const ext = matches ? (matches[1] === 'png' ? 'png' : 'jpg') : 'jpg';
        const base64Data = matches ? matches[2] : imageUri.replace(/^data:[^;]+;base64,/, '');
        const filename = `history_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;
        await RNFS.writeFile(filePath, base64Data, 'base64');
        persistentUri = `file://${filePath}`;
      } catch (fsErr) {
        console.warn('Failed to save history image to disk:', fsErr);
      }
    }

    const history = await getHistory();
    const newItem: HistoryItem = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUri: persistentUri,
      createdAt: Date.now(),
    };

    // Add new item to the beginning of the array
    const updatedHistory = [newItem, ...history];

    // Keep only the last 30 items to prevent storage issues
    const limitedHistory = updatedHistory.slice(0, 30);

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error: any) {
    console.error('Error getting history, clearing oversized CursorWindow row:', error?.message || error);
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (_) {}
    return [];
  }
};

export const deleteFromHistory = async (ids: string[]): Promise<void> => {
  try {
    const history = await getHistory();
    const updatedHistory = history.filter(item => !ids.includes(item.id));
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting from history:', error);
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};
