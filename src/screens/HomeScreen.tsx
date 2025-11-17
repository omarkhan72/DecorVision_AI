import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DesignScreen from './DesignScreen';
import HistoryScreen from './HistoryScreen';
import SettingsScreen from './SettingsScreen';
import SubscriptionScreen from './SubscriptionScreen';
import InteriorsListScreen from './InteriorsListScreen';
import ExteriorsListScreen from './ExteriorsListScreen';
import InteriorUploadScreen from './InteriorUploadScreen';
import ExteriorUploadScreen from './ExteriorUploadScreen';
import GardenUploadScreen from './GardenUploadScreen';
import ReplaceUploadScreen from './ReplaceUploadScreen';
import NewWallsUploadScreen from './NewWallsUploadScreen';
import NewFlooringUploadScreen from './NewFlooringUploadScreen';
import CleanupUploadScreen from './CleanupUploadScreen';
import RoomTypeSelectionScreen from './RoomTypeSelectionScreen';
import RoomTypeExteriorScreen from './RoomTypeExteriorScreen';
import RoomTypeGardenScreen from './RoomTypeGardenScreen';
import RoomTypeReplaceScreen from './RoomTypeReplaceScreen';
import RoomTypeNewWallsScreen from './RoomTypeNewWallsScreen';
import RoomTypeNewFlooringScreen from './RoomTypeNewFlooringScreen';
import RoomTypeCleanupScreen from './RoomTypeCleanupScreen';
import InteriorStyleSelectionScreen from './InteriorStyleSelectionScreen';
import DesignResultScreen from './DesignResultScreen';
import DesignLoadingScreen from './DesignLoadingScreen';
import StyleDetailScreen from './StyleDetailScreen';

// Custom Fence Icon Component (Three Vertical Bars)
const FenceIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View style={[styles.fenceIcon, { width: size, height: size }]}>
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
  </View>
);

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Home' | 'Design' | 'History'>('Home');
  const [currentRoute, setCurrentRoute] = useState<'Tabs' | 'Settings' | 'Subscription' | 'Interiors' | 'Exteriors' | 'InteriorUpload' | 'ExteriorUpload' | 'GardenUpload' | 'ReplaceUpload' | 'NewWallsUpload' | 'NewFlooringUpload' | 'CleanupUpload' | 'RoomTypeSelection' | 'RoomTypeExterior' | 'RoomTypeGarden' | 'RoomTypeReplace' | 'RoomTypeNewWalls' | 'RoomTypeNewFlooring' | 'RoomTypeCleanup' | 'InteriorStyleSelection' | 'DesignLoading' | 'DesignResult' | 'StyleDetail'>('Tabs');
  const [selectedStyleImage, setSelectedStyleImage] = useState<any>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('Living Room');
  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);
  const [designType, setDesignType] = useState<'interior' | 'exterior' | 'garden' | 'replace' | 'newwalls' | 'newflooring' | 'cleanup'>('interior');

  // Reanimated shared values
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 60], [0, -60], Extrapolate.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 40], [1, 0], Extrapolate.CLAMP);
    return { transform: [{ translateY }], opacity };
  });

  const homeScale = useSharedValue(1);
  const designScale = useSharedValue(1);
  const historyScale = useSharedValue(1);

  useEffect(() => {
    homeScale.value = withTiming(activeTab === 'Home' ? 1.12 : 1, { duration: 180 });
    designScale.value = withTiming(activeTab === 'Design' ? 1.12 : 1, { duration: 180 });
    historyScale.value = withTiming(activeTab === 'History' ? 1.12 : 1, { duration: 180 });
  }, [activeTab]);

  const homeIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: homeScale.value }] }));
  const designIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: designScale.value }] }));
  const historyIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: historyScale.value }] }));

  // Beautiful card press animation component
  const BouncyCard = useMemo(() => {
    return ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
      const scale = useSharedValue(1);
      const opacity = useSharedValue(1);
      
      const onPressIn = () => {
        scale.value = withTiming(0.98, { duration: 150 });
        opacity.value = withTiming(0.95, { duration: 150 });
      };
      
      const onPressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        opacity.value = withTiming(1, { duration: 150 });
      };
      
      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      }));
      
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}>
          <Animated.View style={animatedStyle}>{children}</Animated.View>
        </TouchableOpacity>
      );
    };
  }, []);

  const categories = [
    { name: 'Interior Design', icon: 'couch', isCustom: false }, // Sofa icon
    { name: 'Exterior Design', icon: 'home', isCustom: false },
    { name: 'Garden Design', icon: 'fence', isCustom: true }, // Custom three vertical bars
  ];

  const featureCards = [
    {
      id: 1,
      title: 'Interior Design',
      description: 'Transform your interior space',
      image: require('../assets/images/interior-design.jpg'),
    },
    {
      id: 2,
      title: 'Exterior Design',
      description: 'Transform your exterior space',
      image: require('../assets/images/exterior-design.jpg'),
    },
    {
      id: 3,
      title: 'Garden Design',
      description: 'Transfer your garden',
      image: require('../assets/images/garden-design.jpg'),
    },
    {
      id: 4,
      title: 'Replace',
      description: 'Replace any part of your space',
      image: require('../assets/images/replace.jpg'),
    },
    {
      id: 5,
      title: 'Style Transfer',
      description: 'Apply style from reference image',
      image: require('../assets/images/style-transfer.jpg'),
    },
    {
      id: 6,
      title: 'New walls',
      description: 'Change paint wall paper and more',
      image: require('../assets/images/new-walls.jpg'),
    },
    {
      id: 7,
      title: 'New Flooring',
      description: 'Chose wood, carpet, tile, and more',
      image: require('../assets/images/new-flooring.jpg'),
    },
    {
      id: 8,
      title: 'Cleanup',
      description: 'Delete selected object',
      image: require('../assets/images/cleanup.jpg'),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header (hidden on Settings & Subscription routes) */}
      {currentRoute === 'Tabs' && (
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconWrapper}>
            <MaterialCommunityIcons name="flower" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.logoTextRegular}>Dream </Text>
            <Text style={styles.logoTextPurple}>Ai</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.proButton} onPress={() => setCurrentRoute('Subscription')}>
            <FontAwesome name="star" size={16} color="#FFD700" style={{ marginRight: 6 }} />
            <Text style={styles.proButtonText}>Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setCurrentRoute('Settings')}>
            <FontAwesome5 name="cog" size={24} color="#1A1A1A" solid={false} />
          </TouchableOpacity>
        </View>
      </View>
      )}

      {currentRoute === 'Subscription' ? (
        <SubscriptionScreen onBack={() => setCurrentRoute('Tabs')} />
      ) : currentRoute === 'Settings' ? (
        <SettingsScreen onBack={() => setCurrentRoute('Tabs')} onUpgrade={() => setCurrentRoute('Subscription')} />
      ) : currentRoute === 'InteriorUpload' ? (
        <InteriorUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeSelection');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'ExteriorUpload' ? (
        <ExteriorUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeExterior');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'GardenUpload' ? (
        <GardenUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeGarden');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'ReplaceUpload' ? (
        <ReplaceUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeReplace');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'NewWallsUpload' ? (
        <NewWallsUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeNewWalls');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'NewFlooringUpload' ? (
        <NewFlooringUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeNewFlooring');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'CleanupUpload' ? (
        <CleanupUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeCleanup');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'RoomTypeCleanup' ? (
        <RoomTypeCleanupScreen 
          onBack={() => setCurrentRoute('CleanupUpload')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('InteriorStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeNewFlooring' ? (
        <RoomTypeNewFlooringScreen 
          onBack={() => setCurrentRoute('NewFlooringUpload')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('InteriorStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeNewWalls' ? (
        <RoomTypeNewWallsScreen 
          onBack={() => setCurrentRoute('NewWallsUpload')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('InteriorStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeReplace' ? (
        <RoomTypeReplaceScreen 
          onBack={() => setCurrentRoute('ReplaceUpload')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('InteriorStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeGarden' ? (
        <RoomTypeGardenScreen 
          onBack={() => setCurrentRoute('GardenUpload')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('InteriorStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeExterior' ? (
        <RoomTypeExteriorScreen 
          onBack={() => setCurrentRoute('ExteriorUpload')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('InteriorStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeSelection' ? (
        <RoomTypeSelectionScreen 
          onBack={() => setCurrentRoute('InteriorUpload')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('InteriorStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'InteriorStyleSelection' ? (
        <InteriorStyleSelectionScreen 
          onBack={() => setCurrentRoute('RoomTypeSelection')} 
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('DesignLoading');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'DesignLoading' ? (
        <DesignLoadingScreen 
          onComplete={() => setCurrentRoute('DesignResult')} 
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'DesignResult' ? (
        <DesignResultScreen 
          onBack={() => setCurrentRoute('Tabs')} 
          onRegenerate={() => {
            // Navigate back to the correct upload screen based on design type
            if (designType === 'exterior') {
              setCurrentRoute('ExteriorUpload');
            } else if (designType === 'garden') {
              setCurrentRoute('GardenUpload');
            } else if (designType === 'replace') {
              setCurrentRoute('ReplaceUpload');
            } else if (designType === 'newwalls') {
              setCurrentRoute('NewWallsUpload');
            } else if (designType === 'newflooring') {
              setCurrentRoute('NewFlooringUpload');
            } else if (designType === 'cleanup') {
              setCurrentRoute('CleanupUpload');
            } else {
              setCurrentRoute('InteriorUpload');
            }
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'Interiors' ? (
        <InteriorsListScreen
          onBack={() => setCurrentRoute('Tabs')}
          onImagePress={(image, roomName) => {
            setSelectedStyleImage(image);
            setSelectedRoomName(roomName);
            setDesignType('interior');
            setCurrentRoute('StyleDetail');
          }}
        />
      ) : currentRoute === 'Exteriors' ? (
        <ExteriorsListScreen
          onBack={() => setCurrentRoute('Tabs')}
          onImagePress={(image, roomName) => {
            setSelectedStyleImage(image);
            setSelectedRoomName(roomName);
            setDesignType('exterior');
            setCurrentRoute('StyleDetail');
          }}
        />
      ) : currentRoute === 'StyleDetail' ? (
        <StyleDetailScreen
          onBack={() => setCurrentRoute('Tabs')}
          onTryStyle={() => {
            // Keep the selected image and navigate to the correct upload screen based on design type
            if (designType === 'exterior') {
              setCurrentRoute('ExteriorUpload');
            } else {
              setCurrentRoute('InteriorUpload');
            }
          }}
          roomName={selectedRoomName}
          image={selectedStyleImage}
        />
      ) : activeTab === 'Home' ? (
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}>
          {/* Category Navigation - Horizontal ScrollView */}
          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
              style={styles.categoryScrollView}>
              {categories.map((category, index) => (
                <TouchableOpacity key={index} style={styles.categoryButton}>
                  <View style={styles.categoryIconContainer}>
                    {category.isCustom ? (
                      <FenceIcon size={18} color="#FFFFFF" />
                    ) : (
                      <FontAwesome
                        name={category.icon}
                        size={18}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                  <Text style={styles.categoryText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            {featureCards.map((card) => (
              <BouncyCard
                key={card.id}
                onPress={() => {
                  setUserUploadedImage(null); // Reset when starting new flow
                  // Check which design type to route to
                  if (card.id === 2) {
                    setDesignType('exterior');
                    setCurrentRoute('ExteriorUpload');
                  } else if (card.id === 3) {
                    setDesignType('garden');
                    setCurrentRoute('GardenUpload');
                  } else if (card.id === 4) {
                    setDesignType('replace');
                    setCurrentRoute('ReplaceUpload');
                  } else if (card.id === 6) {
                    setDesignType('newwalls');
                    setCurrentRoute('NewWallsUpload');
                  } else if (card.id === 7) {
                    setDesignType('newflooring');
                    setCurrentRoute('NewFlooringUpload');
                  } else if (card.id === 8) {
                    setDesignType('cleanup');
                    setCurrentRoute('CleanupUpload');
                  } else {
                    setDesignType('interior');
                    setCurrentRoute('InteriorUpload');
                  }
                }}>
                <View style={styles.card}>
                  <Image source={card.image} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardTextContainer}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardDescription}>{card.description}</Text>
                    </View>
                    <FontAwesome name="chevron-right" size={20} color="#1A1A1A" />
                  </View>
                </View>
              </BouncyCard>
            ))}
          </View>
        </Animated.ScrollView>
      ) : activeTab === 'Design' ? (
        <DesignScreen onOpenInteriors={() => setCurrentRoute('Interiors')} onOpenExteriors={() => setCurrentRoute('Exteriors')} />
      ) : (
        <HistoryScreen key={activeTab} />
      )}

      {/* Bottom Navigation */}
      {currentRoute === 'Tabs' && (
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
          <Animated.View style={[activeTab === 'Home' ? styles.navIconContainerActive : styles.navIconContainerInactive, homeIconStyle]}>
            <FontAwesome name="home" size={20} color={activeTab === 'Home' ? '#8B5CF6' : '#1A1A1A'} />
          </Animated.View>
          <Text style={[styles.navText, activeTab === 'Home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Design')}>
          <Animated.View style={[activeTab === 'Design' ? styles.navIconContainerActive : styles.navIconContainerInactive, designIconStyle]}>
            <MaterialCommunityIcons name="brush" size={18} color={activeTab === 'Design' ? '#8B5CF6' : '#1A1A1A'} />
          </Animated.View>
          <Text style={[styles.navText, activeTab === 'Design' && styles.navTextActive]}>Design</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('History')}>
          <Animated.View style={[activeTab === 'History' ? styles.navIconContainerActive : styles.navIconContainerInactive, historyIconStyle]}>
            <FontAwesome name="history" size={18} color={activeTab === 'History' ? '#8B5CF6' : '#1A1A1A'} />
          </Animated.View>
          <Text style={[styles.navText, activeTab === 'History' && styles.navTextActive]}>History</Text>
        </TouchableOpacity>
      </View>
      )}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconWrapper: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '400',
  },
  logoTextRegular: {
    fontWeight: '400',
    color: '#1A1A1A',
  },
  logoTextPurple: {
    fontWeight: '700',
    color: '#8B5CF6',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  proButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  settingsButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    backgroundColor: '#FFFFFF',
  },
  categorySection: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
  },
  categoryScrollView: {
    maxHeight: 60,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 16,
    marginRight: 10,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  categoryText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    flexShrink: 0,
    includeFontPadding: false,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F8FB',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#EDF0F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navIconContainerActive: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navIconContainerInactive: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '400',
  },
  navTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  fenceIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  fenceBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default HomeScreen;
