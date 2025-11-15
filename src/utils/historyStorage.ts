import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@design_history';

export interface HistoryItem {
  id: string;
  imageUri: string;
  createdAt: number;
}

export const saveToHistory = async (imageUri: string): Promise<void> => {
  try {
    const history = await getHistory();
    const newItem: HistoryItem = {
      id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUri,
      createdAt: Date.now(),
    };
    
    // Add new item to the beginning of the array
    const updatedHistory = [newItem, ...history];
    
    // Keep only the last 50 items to prevent storage issues
    const limitedHistory = updatedHistory.slice(0, 50);
    
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
  } catch (error) {
    console.error('Error getting history:', error);
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

