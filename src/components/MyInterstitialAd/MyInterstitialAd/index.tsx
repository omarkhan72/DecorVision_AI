import React, {useEffect, useState} from 'react';
import {
  Modal,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Animated,
  Linking,
  ImageProps,
  Platform,
} from 'react-native';
import {PRE_LOADED_BANNERS} from './AdsImages/PRE_LOADED_ADS';

// Make analytics import optional
let analytics: any = null;
try {
  analytics = require('@react-native-firebase/analytics').default;
} catch (error) {
  console.log('Firebase analytics not available');
}

const CLOSE_ICON = require('./AdsImages/CloseIcon.png');

interface AdStructure {
  imagePath: ImageProps;
  appLink: string;
  title: string;
}

interface MyInterstitialAdProps {
  modalVisible: boolean;
  onClose: () => void;
}

const MyInterstitialAd: React.FC<MyInterstitialAdProps> = ({
  modalVisible,
  onClose,
}) => {
  const [randomBanner, setRandomBanner] = useState<AdStructure | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCloseBtn, setShowCloseBtn] = useState(false);

  useEffect(() => {
    console.log('🎯 MyInterstitialAd modalVisible changed:', modalVisible);
    if (modalVisible) {
      const banner = getRandomPreLoadedBanner(PRE_LOADED_BANNERS);
      console.log('🎯 Setting random banner:', banner?.title);
      setRandomBanner(banner);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [modalVisible]);

  useEffect(() => {
    const timeout = setTimeout(() => setShowCloseBtn(true), 2000);

    return () => {
      // setRandomBanner(null);
      setShowCloseBtn(false);
      clearTimeout(timeout);
    };
  }, [modalVisible]);

  const onAdClicked = () => {
    if (analytics && randomBanner?.title) {
      // Sanitize event name to follow Firebase rules
      const eventName = `${randomBanner.title}_int_clicked`
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/^[0-9]/, 'event_$&')
        .substring(0, 40);
      analytics().logEvent(eventName);
    }
    if (randomBanner?.appLink) {
      Linking.openURL(randomBanner.appLink);
    } else {
      // If no app link, just close the ad
      console.log('No app link available, closing ad');
      onAdClosed();
    }
  };

  const onAdClosed = () => {
    if (analytics && randomBanner?.title) {
      // Sanitize event name to follow Firebase rules
      const eventName = `${randomBanner.title}_int_impression`
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/^[0-9]/, 'event_$&')
        .substring(0, 40);
      analytics().logEvent(eventName);
    }
    setRandomBanner(getRandomPreLoadedBanner(PRE_LOADED_BANNERS));
    onClose();
  };

  console.log('🎯 MyInterstitialAd render - modalVisible:', modalVisible, 'randomBanner:', !!randomBanner);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Blurred background image */}
        {randomBanner && (
          <Image 
            source={randomBanner?.imagePath} 
            style={styles.backgroundImage}
            blurRadius={10}
          />
        )}
        
        {/* Dark overlay on top of blurred background */}
        <View style={styles.backgroundOverlay} />
        
        {showCloseBtn && (
          <TouchableOpacity style={styles.closeButton} onPress={onAdClosed}>
            <Image source={CLOSE_ICON} style={styles.closeIcon} />
          </TouchableOpacity>
        )}

        {randomBanner && (
          <Animated.View style={[styles.adContainer, {opacity: fadeAnim}]}>
            <TouchableOpacity
              onPress={onAdClicked}
              style={styles.adTouchableArea}>
              <Image 
                source={randomBanner?.imagePath} 
                style={styles.adImage}
                onError={(error) => console.log('Interstitial image load error:', error)}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={styles.adBox}>
          <Text style={styles.adText}>AD</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black overlay
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    zIndex: 1000,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  adContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 80, // Account for close button
    paddingBottom: 80, // Account for AD label
  },
  adTouchableArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adImage: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  adBox: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  adText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MyInterstitialAd;

function getRandomPreLoadedBanner(preLoadedBanners: any) {
  console.log(`[FALLBACK_AD] Platform: ${Platform.OS}, Total banners: ${preLoadedBanners.length}`);
  
  // First try to get banners with both image and app link
  let platformBanners = preLoadedBanners.filter(
    (banner: any) => banner.imagePath && banner.appLink,
  );
  
  console.log(`[FALLBACK_AD] Banners with image AND appLink: ${platformBanners.length}`);

  // If no valid banners found (especially on iOS), try to get banners with just images
  if (platformBanners.length === 0) {
    console.log('No banners with both image and app link, trying image-only banners...');
    platformBanners = preLoadedBanners.filter(
      (banner: any) => banner.imagePath,
    );
    
    console.log(`[FALLBACK_AD] Banners with just images: ${platformBanners.length}`);
    
    // If still no banners, log and return null
    if (platformBanners.length === 0) {
      console.log('No valid banners available for current platform.');
      return null;
    }
  }

  const randomIndex = Math.floor(Math.random() * platformBanners.length);
  const selectedBanner = platformBanners[randomIndex];

  console.log('Selected Banner:', selectedBanner?.title);
  console.log('Banner has appLink:', !!selectedBanner?.appLink);
  console.log('Banner has imagePath:', !!selectedBanner?.imagePath);
  return selectedBanner;
}
