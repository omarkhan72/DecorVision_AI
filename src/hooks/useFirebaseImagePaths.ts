import { useState, useEffect } from 'react';
import storage from '@react-native-firebase/storage';

/**
 * In-memory cache for individual Firebase Storage file download URLs.
 * Key: storage path (e.g. 'iconImage.webp'), Value: download URL string
 */
const pathCache: Map<string, string> = new Map();

/**
 * Hook to retrieve remote image download URLs by path name from Firebase Storage.
 *
 * @param paths - Array of file paths (e.g. ['iconImage.webp', 'interior-design.webp'])
 */
export const useFirebaseImagePaths = (paths: string[]) => {
  const cacheKey = paths.join('|');
  const allCached = paths.length > 0 && paths.every(p => pathCache.has(p));

  const [images, setImages] = useState<Record<string, { uri: string }>>(() => {
    const initial: Record<string, { uri: string }> = {};
    paths.forEach(p => {
      const cached = pathCache.get(p);
      if (cached) {
        initial[p] = { uri: cached };
      }
    });
    return initial;
  });
  const [loading, setLoading] = useState(!allCached);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (allCached) {
      const cached: Record<string, { uri: string }> = {};
      paths.forEach(p => {
        cached[p] = { uri: pathCache.get(p)! };
      });
      setImages(cached);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchUrls = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(
          paths.map(async (path) => {
            if (pathCache.has(path)) {
              return { path, url: pathCache.get(path)! };
            }
            try {
              const storageRef = storage().ref(path);
              const url = await storageRef.getDownloadURL();
              pathCache.set(path, url);
              return { path, url };
            } catch (err) {
              console.error(`Error fetching download URL for path: ${path}`, err);
              return { path, url: null };
            }
          })
        );

        if (isMounted) {
          const urlMap: Record<string, { uri: string }> = {};
          results.forEach(r => {
            if (r.url) {
              urlMap[r.path] = { uri: r.url };
            }
          });
          setImages(urlMap);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching Firebase image paths:', err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchUrls();

    return () => {
      isMounted = false;
    };
  }, [cacheKey]);

  return { images, loading, error };
};
