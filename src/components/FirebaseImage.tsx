import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, ImageProps, ImageSourcePropType } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export interface FirebaseImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType | string | undefined | null;
  fallbackColor?: string;
  showSpinner?: boolean;
}

export const FirebaseImage: React.FC<FirebaseImageProps> = ({
  source,
  style,
  fallbackColor = '#F3F4F6',
  showSpinner = true,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Normalize source
  let resolvedSource: any = null;
  if (source) {
    if (typeof source === 'string') {
      resolvedSource = { uri: source };
    } else if (typeof source === 'object') {
      resolvedSource = source;
    } else if (typeof source === 'number') {
      resolvedSource = source;
    } else {
      resolvedSource = source;
    }
  }

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (e: any) => {
    setError(true);
    setLoading(false);
    console.error('FirebaseImage failed to load source:', source, e.nativeEvent?.error);
  };

  if (!resolvedSource || error) {
    return (
      <View style={[style, styles.fallbackContainer, { backgroundColor: fallbackColor }]}>
        <MaterialCommunityIcons name="image-broken-variant" size={24} color="#9CA3AF" />
      </View>
    );
  }

  return (
    <View style={[style, styles.container]}>
      <Image
        {...props}
        source={resolvedSource}
        style={[StyleSheet.absoluteFill, style]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {loading && showSpinner && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.6)',
  },
});

export default FirebaseImage;
