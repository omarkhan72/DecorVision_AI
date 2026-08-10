import { useState, useEffect } from 'react';
import { ImageSourcePropType } from 'react-native';

/**
 * Local Static Assets Map.
 * Maps storage file paths directly to local assets using require().
 * This completely removes the Firebase Storage dependency and avoids billing errors.
 */
const LOCAL_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  'iconImage.webp': require('../assets/iconImage.webp'),
  'interior-design.webp': require('../assets/interior-design.webp'),
  'exterior-design.webp': require('../assets/exterior-design.webp'),
  'garden-design.webp': require('../assets/garden-design.webp'),
  'replace.webp': require('../assets/replace.webp'),
  'new-walls.webp': require('../assets/new-walls.webp'),
  'new-flooring.webp': require('../assets/new-flooring.webp'),
  'cleanup.webp': require('../assets/cleanup.webp'),
  'splashScreen.webp': require('../assets/splashScreen.webp'),
  'Interior (1).webp': require('../assets/Interior (1).webp'),
  'Interior (2).webp': require('../assets/Interior (2).webp'),
  'exterior  (1).webp': require('../assets/exterior  (1).webp'),
  'exterior  (2).webp': require('../assets/exterior  (2).webp'),
  'Garden (1).webp': require('../assets/Garden (1).webp'),
  'Garden (2).webp': require('../assets/Garden (2).webp'),
  'replace (1).webp': require('../assets/replace (1).webp'),
  'replace (2).webp': require('../assets/replace (2).webp'),
  'Flooring (1).webp': require('../assets/Flooring (1).webp'),
  'Flooring (2).webp': require('../assets/Flooring (2).webp'),
  'interiorslide1.webp': require('../assets/interiorslide1.webp'),
  'interiorslide2.webp': require('../assets/interiorslide2.webp'),
  'Exteriorslide1 (1).webp': require('../assets/Exteriorslide1 (1).webp'),
  'Exteriorslide2.webp': require('../assets/Exteriorslide2.webp'),
  'Gardenslide1.webp': require('../assets/Gardenslide1.webp'),
  'Gardenslide2.webp': require('../assets/Gardenslide2.webp'),
  'flooringslide1.webp': require('../assets/flooringslide1.webp'),
  'flooringslide2.webp': require('../assets/flooringslide2.webp'),
  'replaceslide1.webp': require('../assets/replaceslide1.webp'),
  'replaceslide2.webp': require('../assets/replaceslide2.webp'),
  'firstonbording.webp': require('../assets/firstonbording.webp'),
  'firstonbording2.webp': require('../assets/firstonbording2.webp'),
  'secondonbording1.webp': require('../assets/secondonbording1.webp'),
  'secondonbording2.webp': require('../assets/secondonbording2.webp'),
  'thirdonbording1.webp': require('../assets/thirdonbording1.webp'),
  'thirdonbording2.webp': require('../assets/thirdonbording2.webp'),
  'onbordingscreen2.webp': require('../assets/onbordingscreen2.webp'),
  'onbordingscreen3.webp': require('../assets/onbordingscreen3.webp'),
};

/**
 * Hook to retrieve static local images by path name.
 * Firebase Storage logic has been stripped out to prevent delinquent billing errors.
 *
 * @param paths - Array of file paths (e.g. ['iconImage.webp', 'interior-design.webp'])
 */
export const useFirebaseImagePaths = (paths: string[]) => {
  const [images, setImages] = useState<Record<string, ImageSourcePropType>>(() => {
    const map: Record<string, ImageSourcePropType> = {};
    paths.forEach((p) => {
      if (LOCAL_IMAGE_MAP[p]) {
        map[p] = LOCAL_IMAGE_MAP[p];
      }
    });
    return map;
  });

  useEffect(() => {
    const map: Record<string, ImageSourcePropType> = {};
    paths.forEach((p) => {
      if (LOCAL_IMAGE_MAP[p]) {
        map[p] = LOCAL_IMAGE_MAP[p];
      }
    });
    setImages(map);
  }, [paths.join('|')]);

  return { images, loading: false, error: null };
};
