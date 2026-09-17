import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
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
import AutoBeforeAfterSlider from '../../components/AutoBeforeAfterSlider';
import DesignScreen from '../shared_loading/DesignScreen';
import HistoryScreen from './HistoryScreen';
import SettingsScreen from './SettingsScreen';
import SubscriptionScreen from './SubscriptionScreen';
import InteriorsListScreen from '../interior/InteriorsListScreen';
import ExteriorsListScreen from '../exterior/ExteriorsListScreen';
import InteriorUploadScreen from '../interior/InteriorUploadScreen';
import ExteriorUploadScreen from '../exterior/ExteriorUploadScreen';
import GardenUploadScreen from '../garden/GardenUploadScreen';
import ReplaceUploadScreen from '../object_replace/ReplaceUploadScreen';
import NewWallsUploadScreen from '../walls/NewWallsUploadScreen';
import NewFlooringUploadScreen from '../flooring/NewFlooringUploadScreen';
import BlueprintUploadScreen from '../blueprint/BlueprintUploadScreen';
import RoomTypeSelectionScreen from '../interior/RoomTypeSelectionScreen';
import RoomTypeExteriorScreen from '../exterior/RoomTypeExteriorScreen';
import RoomTypeGardenScreen from '../garden/RoomTypeGardenScreen';
import RoomTypeReplaceScreen from '../object_replace/RoomTypeReplaceScreen';
import RoomTypeNewWallsScreen from '../walls/RoomTypeNewWallsScreen';
import RoomTypeNewFlooringScreen from '../flooring/RoomTypeNewFlooringScreen';
import InteriorStyleSelectionScreen from '../interior/InteriorStyleSelectionScreen';
import NewFlooringStyleSelectionScreen from '../flooring/NewFlooringStyleSelectionScreen';
import NewWallsStyleSelectionScreen from '../walls/NewWallsStyleSelectionScreen';
import DesignResultScreen from '../shared_loading/DesignResultScreen';
import DesignLoadingScreen from '../shared_loading/DesignLoadingScreen';
import StyleDetailScreen from '../interior/StyleDetailScreen';
import ReplaceMaskScreen from '../object_replace/ReplaceMaskScreen';
import ReplacePromptScreen from '../object_replace/ReplacePromptScreen';
import BlueprintPromptScreen from '../blueprint/BlueprintPromptScreen';
import { generateDesignDirectly } from '../../services/GeminiDirectService';
import { Alert } from 'react-native';
import { logScreenView, logButtonClick } from '../../utils/crashlytics';
import { convertImageToBase64 } from '../../utils/imageUtils';
import { useFirebaseImagePaths } from '../../hooks/useFirebaseImagePaths';
import FirebaseImage from '../../components/FirebaseImage';
import SkeletonItem from '../../components/SkeletonLoader';

// All root-level image paths in Firebase Storage needed by HomeScreen
const HOME_IMAGE_PATHS = [
  'iconImage.webp',
  'interior-design.webp',
  'exterior-design.webp',
  'garden-design.webp',
  'replace.webp',
  'new-walls.webp',
  'new-flooring.webp',
  'Interior (1).webp',
  'Interior (2).webp',
  'exterior  (1).webp',
  'exterior  (2).webp',
  'Garden (1).webp',
  'Garden (2).webp',
  'replace (1).webp',
  'replace (2).webp',
  'Flooring (1).webp',
  'Flooring (2).webp',
  'interiorslide1.webp',
  'interiorslide2.webp',
  'blueprintslide1.webp',
  'blueprintslide2.webp',
];

// Custom Fence Icon Component (Three Vertical Bars)
const FenceIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View style={[styles.fenceIcon, { width: size, height: size }]}>
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
    <View style={[styles.fenceBar, { backgroundColor: color, width: size * 0.15 }]} />
  </View>
);

import PaywallBottomSheet from '../../components/PaywallBottomSheet';
import MyInterstitialAd from '../../components/MyInterstitialAd/MyInterstitialAd';

// Extracted BouncyCard as a proper top-level component.
// Previously defined inside useMemo which caused hooks to be called inside a factory function — an anti-pattern.
const BouncyCardComponent = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
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

const HomeScreen = () => {
  const { user, consumeToken } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'Home' | 'Design' | 'History'>('Home');
  const [currentRoute, setCurrentRoute] = useState<'Tabs' | 'Settings' | 'Subscription' | 'Interiors' | 'Exteriors' | 'InteriorUpload' | 'ExteriorUpload' | 'GardenUpload' | 'ReplaceUpload' | 'ReplaceMask' | 'ReplacePrompt' | 'NewWallsUpload' | 'NewFlooringUpload' | 'BlueprintUpload' | 'BlueprintPrompt' | 'RoomTypeSelection' | 'RoomTypeExterior' | 'RoomTypeGarden' | 'RoomTypeReplace' | 'RoomTypeNewWalls' | 'RoomTypeNewFlooring' | 'InteriorStyleSelection' | 'NewFlooringStyleSelection' | 'NewWallsStyleSelection' | 'DesignLoading' | 'DesignResult' | 'StyleDetail'>('Tabs');
  const [selectedStyleImage, setSelectedStyleImage] = useState<any>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('Living Room');
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [userUploadedImage, setUserUploadedImage] = useState<string | null>(null);
  const [blueprintImageUri, setBlueprintImageUri] = useState<string | null>(null);
  const [maskImageUri, setMaskImageUri] = useState<string | null>(null);
  const [replacePrompt, setReplacePrompt] = useState<string | null>(null);
  const [designType, setDesignType] = useState<'interior' | 'exterior' | 'garden' | 'replace' | 'newwalls' | 'newflooring' | 'blueprint'>('interior');
  const [isReplacing, setIsReplacing] = useState(false);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);

  const [isAdVisible, setIsAdVisible] = useState(false);

  // Fetch images from Firebase Storage
  const { images: homeImages } = useFirebaseImagePaths(HOME_IMAGE_PATHS);

  // To store the pending resolve function when user opens paywall
  // This allows us to "resume" the action after they successfully interact with the paywall
  const [pendingAction, setPendingAction] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  // Log screen view
  useEffect(() => {
    logScreenView('HomeScreen');
  }, []);

  // Convert image URI to base64 helper function
  // Uses shared utility from ../../utils/imageUtils

  // Helper to check and consume tokens
  const checkAndConsumeToken = async (): Promise<boolean> => {
    // If user is Premium, consume token automatically
    if (user?.isPremium) {
      const success = await consumeToken();
      if (!success) {
        Alert.alert("Error", "Failed to consume premium token.");
        return false;
      }
      return true;
    }

    // For Free users, show the Paywall Bottom Sheet
    return new Promise((resolve) => {
      setPendingAction({ resolve });
      setIsPaywallVisible(true);
    });
  };

  const handlePaywallSubscribe = () => {
    setIsPaywallVisible(false);
    if (pendingAction) {
      pendingAction.resolve(false); // Cancel the current flow to redirect
      setPendingAction(null);
    }
    setCurrentRoute('Subscription');
  };

  const handlePaywallWatchAd = async () => {
    setIsPaywallVisible(false);
    setIsAdVisible(true);
  };

  const handleAdClose = () => {
    setIsAdVisible(false);
    if (pendingAction) {
      pendingAction.resolve(true); // Ad watched, grant access
      setPendingAction(null);
    }
  };

  const handlePaywallUseToken = async () => {
    const success = await consumeToken();
    setIsPaywallVisible(false);
    if (pendingAction) {
      if (success) {
        pendingAction.resolve(true);
      } else {
        Alert.alert("Error", "Failed to use token.");
        pendingAction.resolve(false);
      }
      setPendingAction(null);
    }
  };

  const handlePaywallClose = () => {
    setIsPaywallVisible(false);
    if (pendingAction) {
      pendingAction.resolve(false); // User cancelled
      setPendingAction(null);
    }
  };

  // Handle replace function call
  const handleReplace = async (prompt: string) => {
    if (!userUploadedImage || !prompt.trim()) {
      Alert.alert('Error', 'Missing required information for replacement');
      return;
    }

    // Check and consume token before starting
    const tokenConsumed = await checkAndConsumeToken();
    if (!tokenConsumed) return;

    setIsReplacing(true);
    setReplacePrompt(prompt);
    setCurrentRoute('DesignLoading');

    try {
      console.log('=== Replace Request Started ===');
      console.log('Original image:', userUploadedImage);
      console.log('Mask image:', maskImageUri);
      console.log('Prompt:', prompt);

      // Convert images to base64
      const originalImageBase64 = await convertImageToBase64(userUploadedImage);
      if (!originalImageBase64) {
        throw new Error('Failed to convert original image to base64');
      }

      let maskImageBase64 = null;
      if (maskImageUri) {
        maskImageBase64 = await convertImageToBase64(maskImageUri);
        if (!maskImageBase64) {
          console.warn('Failed to convert mask image, continuing without mask');
        }
      }

      console.log('Calling GeminiDirectService for replace...');
      const fullReplacePrompt = `Replace the masked object/area in this room with: ${prompt.trim()}. Seamlessly blend it with the surrounding lighting, materials, perspectives, and shadows. Photorealistic, 8k resolution, professional architectural interior photography.`;

      const responseData = await generateDesignDirectly(originalImageBase64, fullReplacePrompt);

      console.log('=== Direct Replace Response ===');
      console.log('Success:', responseData?.success);
      console.log('Has image:', responseData?.hasImage);

      if (responseData?.success && (responseData?.imageDataUri || responseData?.imageBase64)) {
        let generatedImageUri = responseData.imageDataUri;
        if (!generatedImageUri && responseData.imageBase64) {
          generatedImageUri = `data:${responseData.imageMimeType || 'image/jpeg'};base64,${responseData.imageBase64}`;
        }

        if (generatedImageUri) {
          console.log('Generated image received, navigating to result');
          setUserUploadedImage(generatedImageUri);
          setCurrentRoute('DesignResult');
        } else {
          throw new Error('No image returned from replace service');
        }
      } else {
        throw new Error(responseData?.message || 'Object replacement failed');
      }
    } catch (error: any) {
      console.error('=== Error in handleReplace ===', error);
      let errorMessage = error?.message || 'Failed to replace object. Please try again.';
      Alert.alert('Replacement Error', errorMessage);
      setCurrentRoute('ReplacePrompt');
    } finally {
      setIsReplacing(false);
    }
  };

  // Handle blueprint 3D design generation call
  const handleBlueprintGenerate = async (imageUri: string, customPrompt?: string) => {
    if (!imageUri) {
      Alert.alert('Error', 'Missing required blueprint image');
      return;
    }

    // Check and consume token before starting
    const tokenConsumed = await checkAndConsumeToken();
    if (!tokenConsumed) return;

    setUserUploadedImage(imageUri);
    setCurrentRoute('DesignLoading');

    try {
      const prompt = customPrompt || `Act as an expert 3D architectural renderer. Convert this 2D architectural floor plan into a photorealistic 3D rendered layout. Strictly maintain the structural integrity, walls, and room placements provided in the blueprint, and render it as a high-quality, fully furnished 3D isometric or top-down perspective.`;

      console.log('=== Blueprint 3D Generation Request Started ===');
      console.log('Blueprint image:', imageUri);
      console.log('Prompt:', prompt);

      // Convert image to base64
      const imageBase64 = await convertImageToBase64(imageUri);
      if (!imageBase64) {
        throw new Error('Failed to convert blueprint image to base64');
      }

      console.log('Calling GeminiDirectService for blueprint 3D conversion...');
      const responseData = await generateDesignDirectly(imageBase64, prompt);

      console.log('=== Direct Blueprint 3D Response ===');
      console.log('Success:', responseData?.success);
      console.log('Has image:', responseData?.hasImage);

      if (responseData?.success && (responseData?.imageDataUri || responseData?.imageBase64)) {
        let generatedImageUri = responseData.imageDataUri;
        if (!generatedImageUri && responseData.imageBase64) {
          generatedImageUri = `data:${responseData.imageMimeType || 'image/jpeg'};base64,${responseData.imageBase64}`;
        }

        if (generatedImageUri) {
          console.log('Generated 3D render received, navigating to result');
          setUserUploadedImage(generatedImageUri);
          setCurrentRoute('DesignResult');
        } else {
          throw new Error('No image in response');
        }
      } else {
        throw new Error(responseData?.message || '3D Design generation failed');
      }
    } catch (error: any) {
      console.error('=== Error in handleBlueprintGenerate ===', error);
      let errorMessage = error?.message || 'Failed to generate 3D design. Please try again.';
      Alert.alert('3D Generation Error', errorMessage);
      setCurrentRoute('BlueprintUpload');
    }
  };

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

  // Beautiful card press animation component - extracted to avoid hooks-in-useMemo anti-pattern
  const BouncyCard = useCallback(({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => {
    return <BouncyCardComponent onPress={onPress}>{children}</BouncyCardComponent>;
  }, []);

  const { width } = Dimensions.get('window');

  const categories = [
    { name: 'Interior Design', icon: 'couch', isCustom: false }, // Sofa icon
    { name: 'Exterior Design', icon: 'home', isCustom: false },
    { name: 'Garden Design', icon: 'fence', isCustom: true }, // Custom three vertical bars
    { name: 'New Walls', icon: 'texture', isCustom: false },
    { name: 'Replace', icon: 'autorenew', isCustom: false },
    { name: 'New Flooring', icon: 'view-grid', isCustom: false },
  ];

  const featureCards = [
    {
      id: 1,
      title: 'Interior Design',
      description: 'Transform your interior space',
      image: homeImages['interior-design.webp'] || { uri: '' },
    },
    {
      id: 2,
      title: 'Exterior Design',
      description: 'Transform your exterior space',
      image: homeImages['exterior-design.webp'] || { uri: '' },
    },
    {
      id: 3,
      title: 'Garden Design',
      description: 'Transfer your garden',
      image: homeImages['garden-design.webp'] || { uri: '' },
    },
    {
      id: 4,
      title: 'Replace',
      description: 'Replace any part of your space',
      image: homeImages['replace.webp'] || { uri: '' },
    },
    {
      id: 6,
      title: 'New walls',
      description: 'Change paint wall paper and more',
      image: homeImages['new-walls.webp'] || { uri: '' },
    },
    {
      id: 7,
      title: 'New Flooring',
      description: 'Chose wood, carpet, tile, and more',
      image: homeImages['new-flooring.webp'] || { uri: '' },
    },
    {
      id: 8,
      title: '3D Design Maker',
      description: 'Create 3D models and designs',
      image: homeImages['blueprintslide2.webp'] || require('../../assets/blueprintslide2.webp'),
    },
  ];

  const cardWidth = width - 40;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header (hidden on Settings & Subscription routes) */}
      {currentRoute === 'Tabs' && (
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={homeImages['iconImage.webp']?.uri ? homeImages['iconImage.webp'] : require('../../assets/iconImage.webp')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>
              <Text style={styles.logoTextRegular}>DecorVision </Text>
              <Text style={styles.logoTextPurple}>AI</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.proButton} onPress={() => {
              logButtonClick('Tokens Button', 'HomeScreen');
              setCurrentRoute('Subscription');
            }}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />
              <Text style={styles.proButtonText}>
                {(user?.tokens?.freeTokens || 0) + (user?.tokens?.premiumTokens || 0)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton} onPress={() => {
              logButtonClick('Settings Button', 'HomeScreen');
              setCurrentRoute('Settings');
            }}>
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
            console.log('=== Interior Upload Continue ===');
            console.log('Image URI received:', imageUri ? 'Yes' : 'No');
            setUserUploadedImage(imageUri);
            setCurrentRoute('RoomTypeSelection');
            console.log('Navigating to Room Type Selection');
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
            setCurrentRoute('ReplaceMask');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'ReplaceMask' ? (
        <ReplaceMaskScreen
          onBack={() => setCurrentRoute('ReplaceUpload')}
          onContinue={(originalImageUri, maskImageUri) => {
            setUserUploadedImage(originalImageUri);
            setMaskImageUri(maskImageUri);
            setCurrentRoute('ReplacePrompt');
          }}
          imageUri={userUploadedImage}
        />
      ) : currentRoute === 'ReplacePrompt' ? (
        <ReplacePromptScreen
          onBack={() => setCurrentRoute('ReplaceMask')}
          onContinue={(prompt) => {
            handleReplace(prompt);
          }}
          originalImageUri={userUploadedImage || ''}
          maskImageUri={maskImageUri || ''}
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
      ) : currentRoute === 'BlueprintUpload' ? (
        <BlueprintUploadScreen
          onBack={() => setCurrentRoute('Tabs')}
          onContinue={(imageUri) => {
            setBlueprintImageUri(imageUri);
            setCurrentRoute('BlueprintPrompt');
          }}
          styleImage={selectedStyleImage}
        />
      ) : currentRoute === 'BlueprintPrompt' ? (
        <BlueprintPromptScreen
          onBack={() => setCurrentRoute('BlueprintUpload')}
          onGenerate={(prompt) => {
            handleBlueprintGenerate(blueprintImageUri!, prompt);
          }}
          blueprintImageUri={blueprintImageUri!}
        />
      ) : currentRoute === 'RoomTypeNewFlooring' ? (
        <RoomTypeNewFlooringScreen
          onBack={() => setCurrentRoute('NewFlooringUpload')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('NewFlooringStyleSelection');
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeNewWalls' ? (
        <RoomTypeNewWallsScreen
          onBack={() => setCurrentRoute('NewWallsUpload')}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('NewWallsStyleSelection');
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
          onContinue={(imageUri, roomType) => {
            console.log('=== Room Type Selected ===');
            console.log('Room type:', roomType);
            console.log('Image URI:', imageUri ? 'Yes' : 'No');
            setUserUploadedImage(imageUri);
            setSelectedRoomType(roomType || null);
            setCurrentRoute('InteriorStyleSelection');
            console.log('Navigating to Style Selection, design type:', designType);
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeExterior' ? (
        <RoomTypeExteriorScreen
          onBack={() => setCurrentRoute('ExteriorUpload')}
          onContinue={(imageUri, roomType) => {
            console.log('=== Room Type Selected ===');
            console.log('Room type:', roomType);
            console.log('Image URI:', imageUri ? 'Yes' : 'No');
            setUserUploadedImage(imageUri);
            setSelectedRoomType(roomType || null);
            setCurrentRoute('InteriorStyleSelection');
            console.log('Navigating to Style Selection, design type:', designType);
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'RoomTypeSelection' ? (
        <RoomTypeSelectionScreen
          onBack={() => setCurrentRoute('InteriorUpload')}
          onContinue={(imageUri, roomType) => {
            console.log('=== Room Type Selected ===');
            console.log('Room type:', roomType);
            console.log('Image URI:', imageUri ? 'Yes' : 'No');
            setUserUploadedImage(imageUri);
            setSelectedRoomType(roomType || null);
            setCurrentRoute('InteriorStyleSelection');
            console.log('Navigating to Style Selection, design type:', designType);
          }}
          userImage={userUploadedImage}
        />
      ) : currentRoute === 'InteriorStyleSelection' ? (
        <InteriorStyleSelectionScreen
          onBack={() => {
            // Navigate back to the correct room type screen based on design type
            if (designType === 'exterior') {
              setCurrentRoute('RoomTypeExterior');
            } else if (designType === 'garden') {
              setCurrentRoute('RoomTypeGarden');
            } else {
              setCurrentRoute('RoomTypeSelection');
            }
          }}
          onContinue={(imageUri) => {
            setUserUploadedImage(imageUri);
            setCurrentRoute('DesignLoading');
          }}
          userImage={userUploadedImage}
          roomType={selectedRoomType}
          designType={designType}
          onBeforeGenerate={checkAndConsumeToken}
        />
      ) : currentRoute === 'NewFlooringStyleSelection' ? (
        <NewFlooringStyleSelectionScreen
          onBack={() => {
            setCurrentRoute('RoomTypeNewFlooring');
          }}
          onContinue={async (imageUri) => {
            const tokenConsumed = await checkAndConsumeToken();
            if (tokenConsumed) {
              setUserUploadedImage(imageUri);
              setCurrentRoute('DesignResult');
            }
          }}
          userImage={userUploadedImage}
          roomType={selectedRoomType}
        />
      ) : currentRoute === 'NewWallsStyleSelection' ? (
        <NewWallsStyleSelectionScreen
          onBack={() => {
            setCurrentRoute('RoomTypeNewWalls');
          }}
          onContinue={async (imageUri) => {
            const tokenConsumed = await checkAndConsumeToken();
            if (tokenConsumed) {
              setUserUploadedImage(imageUri);
              setCurrentRoute('DesignResult');
            }
          }}
          userImage={userUploadedImage}
          roomType={selectedRoomType}
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
            } else if (designType === 'blueprint') {
              setCurrentRoute('BlueprintUpload');
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
                <TouchableOpacity
                  key={index}
                  style={styles.categoryButton}
                  onPress={() => {
                    console.log('=== Category Pressed ===');
                    console.log('Category:', category.name);

                    setUserUploadedImage(null); // Reset

                    if (category.name === 'Interior Design') {
                      setDesignType('interior');
                      setCurrentRoute('InteriorUpload');
                    } else if (category.name === 'Exterior Design') {
                      setDesignType('exterior');
                      setCurrentRoute('ExteriorUpload');
                    } else if (category.name === 'Garden Design') {
                      setDesignType('garden');
                      setCurrentRoute('GardenUpload');
                    } else if (category.name === 'New Walls') {
                      setDesignType('newwalls');
                      setCurrentRoute('NewWallsUpload');
                    } else if (category.name === 'Replace') {
                      setDesignType('replace');
                      setCurrentRoute('ReplaceUpload');
                    } else if (category.name === 'New Flooring') {
                      setDesignType('newflooring');
                      setCurrentRoute('NewFlooringUpload');
                    }
                  }}
                >
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
                  console.log('=== Feature Card Pressed ===');
                  console.log('Card ID:', card.id);
                  console.log('Card Title:', card.title);

                  setUserUploadedImage(null); // Reset when starting new flow
                  console.log('User uploaded image reset');

                  // Check which design type to route to
                  if (card.id === 2) {
                    console.log('Navigating to Exterior Upload');
                    setDesignType('exterior');
                    setCurrentRoute('ExteriorUpload');
                  } else if (card.id === 3) {
                    console.log('Navigating to Garden Upload');
                    setDesignType('garden');
                    setCurrentRoute('GardenUpload');
                  } else if (card.id === 4) {
                    console.log('Navigating to Replace Upload');
                    setDesignType('replace');
                    setCurrentRoute('ReplaceUpload');
                  } else if (card.id === 6) {
                    console.log('Navigating to New Walls Upload');
                    setDesignType('newwalls');
                    setCurrentRoute('NewWallsUpload');
                  } else if (card.id === 7) {
                    console.log('Navigating to New Flooring Upload');
                    setDesignType('newflooring');
                    setCurrentRoute('NewFlooringUpload');
                  } else if (card.id === 8) {
                    console.log('Navigating to Blueprint Upload');
                    setDesignType('blueprint');
                    setCurrentRoute('BlueprintUpload');
                  } else {
                    console.log('Navigating to Interior Upload');
                    setDesignType('interior');
                    setCurrentRoute('InteriorUpload');
                  }
                  console.log('Current route set, design type:', card.id === 2 ? 'exterior' : card.id === 3 ? 'garden' : card.id === 4 ? 'replace' : card.id === 6 ? 'newwalls' : card.id === 7 ? 'newflooring' : card.id === 8 ? 'blueprint' : 'interior');
                }}>
                <View style={styles.card}>
                  {card.title === 'Interior Design' ? (
                    <View style={{ width: cardWidth, height: 200, overflow: 'hidden' }}>
                      <AutoBeforeAfterSlider
                        beforeImage={homeImages['Interior (1).webp'] || { uri: '' }}
                        afterImage={homeImages['Interior (2).webp'] || { uri: '' }}
                        sliderWidth={cardWidth}
                        containerStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                      />
                    </View>
                  ) : card.title === 'Exterior Design' ? (
                    <View style={{ width: cardWidth, height: 200, overflow: 'hidden' }}>
                      <AutoBeforeAfterSlider
                        beforeImage={homeImages['exterior  (1).webp'] || { uri: '' }}
                        afterImage={homeImages['exterior  (2).webp'] || { uri: '' }}
                        sliderWidth={cardWidth}
                        containerStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                        startFrom="left"
                      />
                    </View>
                  ) : card.title === 'Garden Design' ? (
                    <View style={{ width: cardWidth, height: 200, overflow: 'hidden' }}>
                      <AutoBeforeAfterSlider
                        beforeImage={homeImages['Garden (1).webp'] || { uri: '' }}
                        afterImage={homeImages['Garden (2).webp'] || { uri: '' }}
                        sliderWidth={cardWidth}
                        containerStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                      />
                    </View>
                  ) : card.title === 'Replace' ? (
                    <View style={{ width: cardWidth, height: 200, overflow: 'hidden' }}>
                      <AutoBeforeAfterSlider
                        beforeImage={homeImages['replace (1).webp'] || { uri: '' }}
                        afterImage={homeImages['replace (2).webp'] || { uri: '' }}
                        sliderWidth={cardWidth}
                        containerStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                        startFrom="left"
                      />
                    </View>
                  ) : card.title === 'New Flooring' ? (
                    <View style={{ width: cardWidth, height: 200, overflow: 'hidden' }}>
                      <AutoBeforeAfterSlider
                        beforeImage={homeImages['Flooring (1).webp'] || { uri: '' }}
                        afterImage={homeImages['Flooring (2).webp'] || { uri: '' }}
                        sliderWidth={cardWidth}
                        containerStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                        startFrom="left"
                      />
                    </View>
                  ) : card.title === 'New walls' ? (
                    <View style={{ width: cardWidth, height: 200, overflow: 'hidden' }}>
                      <AutoBeforeAfterSlider
                        beforeImage={homeImages['interiorslide1.webp'] || { uri: '' }}
                        afterImage={homeImages['interiorslide2.webp'] || { uri: '' }}
                        sliderWidth={cardWidth}
                        containerStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                      />
                    </View>
                  ) : card.title === '3D Design Maker' ? (
                    <View style={{ width: cardWidth, height: 200, overflow: 'hidden' }}>
                      <AutoBeforeAfterSlider
                        beforeImage={homeImages['blueprintslide1.webp']?.uri ? homeImages['blueprintslide1.webp'] : require('../../assets/blueprintslide1.webp')}
                        afterImage={homeImages['blueprintslide2.webp']?.uri ? homeImages['blueprintslide2.webp'] : require('../../assets/blueprintslide2.webp')}
                        sliderWidth={cardWidth}
                        containerStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
                        startFrom="left"
                      />
                    </View>
                  ) : (
                    card.image ? (
                      <FirebaseImage source={card.image} style={styles.cardImage} />
                    ) : (
                      <SkeletonItem width={cardWidth} height={200} borderRadius={0} />
                    )
                  )}
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
          <TouchableOpacity style={styles.navItem} onPress={() => {
            logButtonClick('Home Tab', 'HomeScreen');
            setActiveTab('Home');
          }}>
            <Animated.View style={[activeTab === 'Home' ? styles.navIconContainerActive : styles.navIconContainerInactive, homeIconStyle]}>
              <FontAwesome name="home" size={20} color={activeTab === 'Home' ? '#8B5CF6' : '#1A1A1A'} />
            </Animated.View>
            <Text style={[styles.navText, activeTab === 'Home' && styles.navTextActive]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => {
            logButtonClick('Design Tab', 'HomeScreen');
            setActiveTab('Design');
          }}>
            <Animated.View style={[activeTab === 'Design' ? styles.navIconContainerActive : styles.navIconContainerInactive, designIconStyle]}>
              <MaterialCommunityIcons name="brush" size={18} color={activeTab === 'Design' ? '#8B5CF6' : '#1A1A1A'} />
            </Animated.View>
            <Text style={[styles.navText, activeTab === 'Design' && styles.navTextActive]}>Design</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => {
            logButtonClick('History Tab', 'HomeScreen');
            setActiveTab('History');
          }}>
            <Animated.View style={[activeTab === 'History' ? styles.navIconContainerActive : styles.navIconContainerInactive, historyIconStyle]}>
              <FontAwesome name="history" size={18} color={activeTab === 'History' ? '#8B5CF6' : '#1A1A1A'} />
            </Animated.View>
            <Text style={[styles.navText, activeTab === 'History' && styles.navTextActive]}>History</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Paywall Bottom Sheet */}
      <PaywallBottomSheet
        visible={isPaywallVisible}
        onClose={handlePaywallClose}
        onSubscribe={handlePaywallSubscribe}
        onWatchAd={handlePaywallWatchAd}
        onUseToken={handlePaywallUseToken}
        tokenCount={(user?.tokens?.freeTokens || 0) + (user?.tokens?.premiumTokens || 0)}
      />

      <MyInterstitialAd
        modalVisible={isAdVisible}
        onClose={handleAdClose}
      />
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
    fontWeight: '700',
  },
  logoTextRegular: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  logoTextPurple: {
    fontWeight: '800',
    color: '#8B5CF6',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF', // Very light purple (glassy feel)
    borderColor: '#E9D5FF', // Light purple border
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  proButtonText: {
    color: '#8B5CF6', // Purple text to match theme
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
  logoIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
    resizeMode: 'cover',
    borderRadius: 10,
  },
});

export default HomeScreen;
