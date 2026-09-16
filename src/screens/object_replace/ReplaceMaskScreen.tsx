import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = {
  onBack: () => void;
  onContinue?: (originalImageUri: string, maskImageUri: string) => void;
  imageUri: string | null;
};

interface Point {
  x: number;
  y: number;
}

const ReplaceMaskScreen = ({ onBack, onContinue, imageUri }: Props) => {
  const insets = useSafeAreaInsets();
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [imageWrapperLayout, setImageWrapperLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [isGeneratingMask, setIsGeneratingMask] = useState(false);
  const viewShotRef = useRef<any>(null); // ViewShot ref - install react-native-view-shot
  const imageRef = useRef<View>(null);
  const isDrawingRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        console.log('=== Touch Started ===');
        console.log('Touch location (relative to container):', { locationX, locationY });
        console.log('Container layout:', imageWrapperLayout);
        
        // locationX/Y are already relative to imageContainer
        // SVG is positioned at 0,0 and covers the full container
        // So we can use locationX/Y directly, just clamp to container bounds
        let adjustedX = Math.max(0, Math.min(locationX, imageWrapperLayout.width || 1000));
        let adjustedY = Math.max(0, Math.min(locationY, imageWrapperLayout.height || 1000));
        
        console.log('Adjusted coordinates:', { adjustedX, adjustedY });
        isDrawingRef.current = true;
        setIsDrawing(true);
        const newPath = [{ x: adjustedX, y: adjustedY }];
        setCurrentPath(newPath);
        console.log('Started drawing path');
      },
      onPanResponderMove: (evt) => {
        if (!isDrawingRef.current) {
          return;
        }
        const { locationX, locationY } = evt.nativeEvent;
        
        // Use coordinates directly, clamped to container
        let adjustedX = Math.max(0, Math.min(locationX, imageWrapperLayout.width || 1000));
        let adjustedY = Math.max(0, Math.min(locationY, imageWrapperLayout.height || 1000));
        
        setCurrentPath((prev) => {
          const newPath = [...prev, { x: adjustedX, y: adjustedY }];
          // Limit path length for performance
          if (newPath.length > 500) {
            return newPath.slice(-500);
          }
          return newPath;
        });
      },
      onPanResponderRelease: () => {
        console.log('=== Touch Released ===');
        if (isDrawingRef.current) {
          setCurrentPath((prevPath) => {
            if (prevPath.length > 0) {
              // Save the path before clearing
              setPaths((prev) => {
                const newPaths = [...prev, prevPath];
                console.log('Path saved, total paths:', newPaths.length);
                return newPaths;
              });
            }
            return []; // Clear current path
          });
        }
        isDrawingRef.current = false;
        setIsDrawing(false);
      },
    })
  ).current;

  const handleUndo = () => {
    if (paths.length > 0) {
      setPaths((prev) => prev.slice(0, -1));
      setCurrentPath([]);
    }
  };

  const handleClear = () => {
    Alert.alert('Clear Drawing', 'Are you sure you want to clear all drawings?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          setPaths([]);
          setCurrentPath([]);
        },
      },
    ]);
  };

  const generateMaskImage = async (): Promise<string | null> => {
    if (!imageUri || paths.length === 0) {
      Alert.alert('Error', 'Please draw on the image to create a mask');
      return null;
    }

    setIsGeneratingMask(true);
    try {
      // Create a canvas-like approach using ViewShot
      // We'll create a mask by drawing white on black background
      const maskWidth = imageLayout.width || SCREEN_WIDTH;
      const maskHeight = imageLayout.height || SCREEN_WIDTH;

      // For now, we'll create a simple base64 mask
      // In a production app, you'd want to use a proper canvas library
      // This is a simplified version that creates a mask path data
      
      // Create SVG path string from all paths
      let pathData = '';
      [...paths, currentPath].forEach((path) => {
        if (path.length > 0) {
          pathData += `M ${path[0].x} ${path[0].y} `;
          for (let i = 1; i < path.length; i++) {
            pathData += `L ${path[i].x} ${path[i].y} `;
          }
        }
      });

      // TODO: Implement proper mask generation using react-native-view-shot
      // For now, we'll create a placeholder mask URI
      // Install: npm install react-native-view-shot
      // Then uncomment ViewShot import and use:
      // if (viewShotRef.current) {
      //   const uri = await viewShotRef.current.capture();
      //   return uri;
      // }
      
      // Placeholder: Return a modified version of the image URI
      // In production, generate actual mask image
      console.log('Mask paths:', paths.length);
      console.log('Note: Install react-native-view-shot for proper mask generation');
      setIsGeneratingMask(false);
      
      // For now, return the original image URI as placeholder
      // The backend should handle mask generation from path data
      return imageUri; // Placeholder - replace with actual mask generation
    } catch (error: any) {
      console.error('Error generating mask:', error);
      Alert.alert('Error', 'Failed to generate mask image');
      setIsGeneratingMask(false);
      return null;
    }
  };

  const handleContinue = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    if (paths.length === 0 && currentPath.length === 0) {
      Alert.alert('Error', 'Please draw on the image to mark the area you want to replace');
      return;
    }

    const maskUri = await generateMaskImage();
    if (maskUri) {
      console.log('=== Continue to Prompt Screen ===');
      console.log('Original image:', imageUri);
      console.log('Mask image:', maskUri);
      onContinue?.(imageUri, maskUri);
    }
  };

  // Render drawing strokes using SVG Path for smooth, persistent drawing
  const renderPath = (path: Point[], index: number) => {
    if (path.length === 0) return null;
    
    // If only one point, render as a circle
    if (path.length === 1) {
      return (
        <Path
          key={`path-${index}-circle`}
          d={`M ${path[0].x} ${path[0].y} m -${brushSize / 2} 0 a ${brushSize / 2} ${brushSize / 2} 0 1 0 ${brushSize} 0 a ${brushSize / 2} ${brushSize / 2} 0 1 0 -${brushSize} 0`}
          fill="rgba(239, 68, 68, 0.85)"
        />
      );
    }
    
    // Create path using simple line segments
    let pathData = `M ${path[0].x} ${path[0].y} `;
    
    // Use all points for smooth drawing
    for (let i = 1; i < path.length; i++) {
      pathData += `L ${path[i].x} ${path[i].y} `;
    }

    return (
      <Path
        key={`path-${index}`}
        d={pathData}
        stroke="rgba(239, 68, 68, 0.85)"
        strokeWidth={brushSize}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  };

  const renderCurrentPath = () => {
    if (currentPath.length === 0) return null;
    
    // If only one point, render as a circle
    if (currentPath.length === 1) {
      return (
        <Path
          d={`M ${currentPath[0].x} ${currentPath[0].y} m -${brushSize / 2} 0 a ${brushSize / 2} ${brushSize / 2} 0 1 0 ${brushSize} 0 a ${brushSize / 2} ${brushSize / 2} 0 1 0 -${brushSize} 0`}
          fill="rgba(239, 68, 68, 0.85)"
        />
      );
    }
    
    // Create path for current drawing
    let pathData = `M ${currentPath[0].x} ${currentPath[0].y} `;
    
    // Use all points for real-time drawing
    for (let i = 1; i < currentPath.length; i++) {
      pathData += `L ${currentPath[i].x} ${currentPath[i].y} `;
    }

    return (
      <Path
        d={pathData}
        stroke="rgba(239, 68, 68, 0.85)"
        strokeWidth={brushSize}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  };

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text>No image selected</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={20} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Area to Replace</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Draw over the object you want to replace
        </Text>
      </View>

      {/* Image with Drawing Overlay */}
      <View 
        style={styles.imageContainer} 
        {...panResponder.panHandlers}
        collapsable={false}>
        <View
          ref={imageRef}
          onLayout={(event) => {
            const { width, height, x, y } = event.nativeEvent.layout;
            console.log('Image wrapper layout updated:', { width, height, x, y });
            setImageWrapperLayout({ width, height, x, y });
            
            // Get the actual image dimensions
            Image.getSize(
              imageUri!,
              (imgWidth, imgHeight) => {
                // Calculate the actual displayed image size (with contain mode)
                const containerAspect = width / height;
                const imageAspect = imgWidth / imgHeight;
                
                let displayWidth = width;
                let displayHeight = height;
                let displayX = 0;
                let displayY = 0;
                
                if (imageAspect > containerAspect) {
                  // Image is wider - fit to width
                  displayWidth = width;
                  displayHeight = width / imageAspect;
                  displayY = (height - displayHeight) / 2;
                } else {
                  // Image is taller - fit to height
                  displayHeight = height;
                  displayWidth = height * imageAspect;
                  displayX = (width - displayWidth) / 2;
                }
                
                console.log('Actual image display area:', {
                  displayWidth,
                  displayHeight,
                  displayX: displayX,
                  displayY: displayY,
                });
                
                // Store image layout relative to wrapper (for SVG positioning)
                setImageLayout({
                  width: displayWidth,
                  height: displayHeight,
                  x: displayX, // Relative to wrapper
                  y: displayY, // Relative to wrapper
                });
              },
              (error) => {
                console.warn('Error getting image size, using container size:', error);
                setImageLayout({ width, height, x: 0, y: 0 }); // Relative to wrapper
              }
            );
          }}
          style={styles.imageWrapper}
          collapsable={false}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              console.log('Image loaded, dimensions:', { width, height });
            }}
          />
          {/* Drawing overlay using SVG - covers full container */}
          {imageWrapperLayout.width > 0 && imageWrapperLayout.height > 0 && (
            <Svg
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: imageWrapperLayout.width,
                height: imageWrapperLayout.height,
                zIndex: 10,
              }}
              width={imageWrapperLayout.width}
              height={imageWrapperLayout.height}
              pointerEvents="none">
              {/* Debug: Show SVG bounds in dev mode */}
              {__DEV__ && (
                <>
                  <Path
                    d={`M 0 0 L ${imageWrapperLayout.width} 0 L ${imageWrapperLayout.width} ${imageWrapperLayout.height} L 0 ${imageWrapperLayout.height} Z`}
                    stroke="rgba(0, 255, 0, 0.3)"
                    strokeWidth="2"
                    fill="none"
                  />
                  {/* Test circle to verify SVG rendering */}
                  <Path
                    d={`M 50 50 m -15 0 a 15 15 0 1 0 30 0 a 15 15 0 1 0 -30 0`}
                    fill="rgba(255, 0, 0, 0.6)"
                  />
                </>
              )}
              {/* Render all completed paths */}
              {paths.map((path, index) => renderPath(path, index))}
              {/* Render current drawing path */}
              {renderCurrentPath()}
            </Svg>
          )}
          {/* Fallback: View-based drawing for debugging */}
          {__DEV__ && imageWrapperLayout.width > 0 && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: imageWrapperLayout.width,
                height: imageWrapperLayout.height,
                zIndex: 5,
                pointerEvents: 'none',
              }}>
              {paths.map((path, pathIndex) =>
                path.map((point, pointIndex) => (
                  <View
                    key={`fallback-${pathIndex}-${pointIndex}`}
                    style={{
                      position: 'absolute',
                      left: point.x - brushSize / 2,
                      top: point.y - brushSize / 2,
                      width: brushSize,
                      height: brushSize,
                      borderRadius: brushSize / 2,
                      backgroundColor: 'rgba(255, 0, 0, 0.5)',
                    }}
                  />
                ))
              )}
              {currentPath.map((point, pointIndex) => (
                <View
                  key={`fallback-current-${pointIndex}`}
                  style={{
                    position: 'absolute',
                    left: point.x - brushSize / 2,
                    top: point.y - brushSize / 2,
                    width: brushSize,
                    height: brushSize,
                    borderRadius: brushSize / 2,
                    backgroundColor: 'rgba(255, 0, 0, 0.7)',
                  }}
                />
              ))}
            </View>
          )}
          {/* Debug info overlay */}
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                Paths: {paths.length} | Current: {currentPath.length} | Layout: {imageWrapperLayout.width}x{imageWrapperLayout.height}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Tools Bar */}
      <View style={styles.toolsBar}>
        <TouchableOpacity
          style={[styles.toolButton, paths.length === 0 && styles.toolButtonDisabled]}
          onPress={handleUndo}
          disabled={paths.length === 0}>
          <FontAwesome name="undo" size={20} color={paths.length === 0 ? '#9CA3AF' : '#1A1A1A'} />
          <Text style={[styles.toolButtonText, paths.length === 0 && styles.toolButtonTextDisabled]}>
            Undo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolButton, paths.length === 0 && styles.toolButtonDisabled]}
          onPress={handleClear}
          disabled={paths.length === 0}>
          <FontAwesome name="trash" size={20} color={paths.length === 0 ? '#9CA3AF' : '#1A1A1A'} />
          <Text style={[styles.toolButtonText, paths.length === 0 && styles.toolButtonTextDisabled]}>
            Clear
          </Text>
        </TouchableOpacity>

        <View style={styles.brushSizeContainer}>
          <Text style={styles.brushSizeLabel}>Brush: {brushSize}px</Text>
          <View style={styles.sliderContainer}>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setBrushSize(Math.max(5, brushSize - 5))}>
              <Text style={styles.sliderButtonText}>-</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${((brushSize - 5) / 45) * 100}%` }]} />
            </View>
            <TouchableOpacity
              style={styles.sliderButton}
              onPress={() => setBrushSize(Math.min(50, brushSize + 5))}>
              <Text style={styles.sliderButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isGeneratingMask || (paths.length === 0 && currentPath.length === 0)}>
          <View
            style={[
              styles.gradient,
              (isGeneratingMask || (paths.length === 0 && currentPath.length === 0)) &&
                styles.gradientDisabled,
            ]}>
            {isGeneratingMask ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.continueButtonText}>Generating Mask...</Text>
              </View>
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F7FF',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  toolsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  toolButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  toolButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 4,
  },
  toolButtonTextDisabled: {
    color: '#9CA3AF',
  },
  brushSizeContainer: {
    flex: 1,
    marginLeft: 20,
  },
  brushSizeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
  },
  gradientDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawPoint: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});

export default ReplaceMaskScreen;

