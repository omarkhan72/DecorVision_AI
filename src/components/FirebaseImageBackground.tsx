import React from 'react';
import { View, StyleSheet, ImageStyle } from 'react-native';
import FirebaseImage, { FirebaseImageProps } from './FirebaseImage';

export interface FirebaseImageBackgroundProps extends FirebaseImageProps {
  children?: React.ReactNode;
  imageStyle?: ImageStyle | ImageStyle[];
}

export const FirebaseImageBackground: React.FC<FirebaseImageBackgroundProps> = ({
  children,
  source,
  style,
  imageStyle,
  fallbackColor = '#F3F4F6',
  showSpinner = true,
  ...props
}) => {
  return (
    <View style={[style, { position: 'relative', overflow: 'hidden' }]}>
      <FirebaseImage
        source={source}
        style={[StyleSheet.absoluteFill, imageStyle]}
        fallbackColor={fallbackColor}
        showSpinner={showSpinner}
        {...props}
      />
      {children}
    </View>
  );
};

export default FirebaseImageBackground;
