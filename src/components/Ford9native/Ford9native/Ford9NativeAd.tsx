import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import adjust from '../../utils/adjust';
import { useNativeAdContext } from '../../context/NativeAdContext';

// Global counter to alternate between apps across all instances
let globalAdCounter = 0;

interface Ford9NativeAdProps {
  style?: any;
}

interface AppInfo {
  id: string;
  packageName: string;
  title: string;
  description: string;
  image: any;
  playStoreUrl: string;
}

const FORD9_APPS: AppInfo[] = [
  {
    id: 'ai-story',
    packageName: 'com.ford9.AI.Story.Maker.Novel.Generator.Creator.Writer.Builder',
    title: 'AI Story Generator',
    description: 'Turn ideas into legendary tales with AI-powered story creation',
    image: require('./NativeadImages/AiStory.png'),
    playStoreUrl:
      'https://play.google.com/store/apps/details?id=com.ford9.AI.Story.Maker.Novel.Generator.Creator.Writer.Builder',
  },
  {
    id: 'ai-code',
    packageName:
      'com.ford9.ai.coding.generator.code.creator.maker.writer.builder.assistant',
    title: 'AI Code Generator',
    description: 'Generate code in Python, JavaScript, HTML, CSS, and more',
    image: require('./NativeadImages/AICode.png'),
    playStoreUrl:
      'https://play.google.com/store/apps/details?id=com.ford9.ai.coding.generator.code.creator.maker.writer.builder.assistant',
  },
];

const Ford9NativeAd: React.FC<Ford9NativeAdProps> = ({ style }) => {
  const { isPremiumUser } = useNativeAdContext();
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const hasSelectedRef = useRef(false);

  // Don't show ads for premium users
  if (isPremiumUser) {
    console.log('💳 Ford9NativeAd - Premium user detected, hiding ad:', { isPremiumUser });
    return null;
  }

  // Alternate between apps using global counter
  useEffect(() => {
    if (!hasSelectedRef.current) {
      // Increment global counter and select app based on counter (alternate)
      const appIndex = globalAdCounter % FORD9_APPS.length;
      globalAdCounter++;
      setSelectedApp(FORD9_APPS[appIndex]);
      hasSelectedRef.current = true;
      console.log('📱 Ford9NativeAd - Selected app:', FORD9_APPS[appIndex].title);
    }
  }, []);

  if (!selectedApp) {
    console.log('⏳ Ford9NativeAd - App not selected yet, waiting...');
    return null;
  }

  console.log('✅ Ford9NativeAd - Rendering ad for:', selectedApp.title);

  const handlePress = async () => {
    try {
      const url = selectedApp.playStoreUrl;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.error('Cannot open Play Store URL');
      }
    } catch (error) {
      console.error('Error opening Play Store:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.adCard}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* App Image - Full ad design */}
        <Image 
          source={selectedApp.image} 
          style={styles.appImage} 
          resizeMode="contain" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: adjust(16),
    width: '100%',
  },
  adCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: adjust(12),
    padding: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: adjust(350),
    overflow: 'hidden',
  },
  appImage: {
    width: '100%',
    height: adjust(200),
    borderRadius: adjust(12),
  },
});

export default Ford9NativeAd;

