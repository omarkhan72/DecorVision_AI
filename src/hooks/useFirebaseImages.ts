import { useState, useEffect } from 'react';
import storage from '@react-native-firebase/storage';

/**
 * In-memory cache for Firebase Storage image URLs.
 * Persists across component mounts so images are only fetched once per session.
 * Key format: `${folderName}_${limit}`
 */
const imageCache: Map<string, any[]> = new Map();

export const useFirebaseImages = (folderName: string, limit?: number) => {
  const cacheKey = `${folderName}_${limit ?? 'all'}`;
  const cachedImages = imageCache.get(cacheKey);

  const [images, setImages] = useState<any[]>(cachedImages || []);
  const [loading, setLoading] = useState(!cachedImages);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we already have cached data, skip the fetch
    if (imageCache.has(cacheKey)) {
      setImages(imageCache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const reference = storage().ref(folderName);
        const result = await reference.listAll();
        
        let itemsToFetch = result.items;
        if (limit) {
          itemsToFetch = itemsToFetch.slice(0, limit);
        }
        
        const urlPromises = itemsToFetch.map(item => item.getDownloadURL());
        const urls = await Promise.all(urlPromises);
        
        const imageObjects = urls.map(url => ({ uri: url }));

        // Store in cache for future use
        imageCache.set(cacheKey, imageObjects);

        if (isMounted) {
          setImages(imageObjects);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`Error fetching images from Firebase Storage folder "${folderName}":`, err);
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [folderName, limit]);

  return { images, loading, error };
};

/**
 * Utility to clear the image cache (e.g. on logout or manual refresh).
 */
export const clearImageCache = () => {
  imageCache.clear();
};
