import { useState, useEffect } from 'react';
import { ImageSourcePropType } from 'react-native';

/**
 * Local Static Sample Images Map for Folders.
 */
const LOCAL_FOLDER_MAP: Record<string, ImageSourcePropType[]> = {
  'Interior samples': [
    require('../assets/Interior samples/9980bb9e0a70db62dfae9bea68a778e6.webp'),
    require('../assets/Interior samples/badroom.webp'),
    require('../assets/Interior samples/bathroom.webp'),
    require('../assets/Interior samples/living room.webp'),
  ],
  'Exterior samples': [
    require('../assets/Exterior samples/Gemini_Generated_Image_5v649s5v649s5v64.webp'),
    require('../assets/Exterior samples/Gemini_Generated_Image_n8wtmkn8wtmkn8wt.webp'),
    require('../assets/Exterior samples/Gemini_Generated_Image_u79xc4u79xc4u79x.webp'),
    require('../assets/Exterior samples/Gemini_Generated_Image_y5luuhy5luuhy5lu.webp'),
  ],
  'Garden samples': [
    require('../assets/Garden samples/Gemini_Generated_Image_3m8wqu3m8wqu3m8w.webp'),
    require('../assets/Garden samples/Gemini_Generated_Image_7st6nv7st6nv7st6.webp'),
    require('../assets/Garden samples/Gemini_Generated_Image_j99eyfj99eyfj99e.webp'),
    require('../assets/Garden samples/Gemini_Generated_Image_zab9kpzab9kpzab9.webp'),
  ],
  'New Flooring samples': [
    require('../assets/New Flooring samples/53a77ab7693c84f299e73831bc9967c2.webp'),
    require('../assets/New Flooring samples/53e5d2c716f898d8d254603fae4d0c7f.webp'),
    require('../assets/New Flooring samples/bf1163114f82d43f0c3413215c02c9b6.webp'),
    require('../assets/New Flooring samples/c12265ce669ff60011b0fa2c05a4d4f5.webp'),
  ],
  'New Walls samples': [
    require('../assets/New Walls samples/11f0e226858ad8f847d01399450cdd95.webp'),
    require('../assets/New Walls samples/2db608f0efb2babf67be791d28792e52.webp'),
    require('../assets/New Walls samples/8a9717044a46a566f3ecd2acf18f5b5c.webp'),
    require('../assets/New Walls samples/c3689a32402de0e02a36090459b86dee.webp'),
  ],
  'Replace samples': [
    require('../assets/Replace samples/4078202662d91e6e5496d3f650572a69.webp'),
    require('../assets/Replace samples/855fab9fae45b6d0e22af2a56483bd81.webp'),
    require('../assets/Replace samples/89ea9a0d49daa9154c82dd5849810881.webp'),
    require('../assets/Replace samples/d4af94dc454058468f4fde144cd7d993.webp'),
  ],
  'Cleanup samples': [
    require('../assets/cleanup.webp'),
    require('../assets/replace.webp'),
    require('../assets/new-walls.webp'),
    require('../assets/new-flooring.webp'),
  ],
};

export const useFirebaseImages = (folderName: string, limit?: number) => {
  const getLoadedImages = () => {
    const list = LOCAL_FOLDER_MAP[folderName] || [];
    return limit ? list.slice(0, limit) : list;
  };

  const [images, setImages] = useState<ImageSourcePropType[]>(getLoadedImages);

  useEffect(() => {
    setImages(getLoadedImages());
  }, [folderName, limit]);

  return { images, loading: false, error: null };
};

export const clearImageCache = () => {
  // No-op for local assets
};
