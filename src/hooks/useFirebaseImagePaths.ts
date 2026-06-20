import { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from '@react-native-firebase/storage';

/**
 * In-memory cache for individual Firebase Storage file download URLs.
 * Key: storage path (e.g. 'iconImage.webp'), Value: download URL string
 */
const pathCache: Map<string, string> = new Map();

/**
 * Fetches download URLs for specific files in Firebase Storage by their exact paths.
 * Unlike useFirebaseImages (which lists all files in a folder), this hook
 * fetches specific files by name — ideal for known, fixed assets.
 *
 * Returns a record mapping each path to an {uri: string} image source object.
 * Uses in-memory caching so URLs are fetched only once per session.
 *
 * @param paths - Array of storage file paths (e.g. ['iconImage.webp', 'interior-design.webp'])
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
      // Populate from cache immediately
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
      try {
        const results = await Promise.all(
          paths.map(async (path) => {
            // Use cached URL if available
            if (pathCache.has(path)) {
              return { path, url: pathCache.get(path)! };
            }
            const storageRef = ref(getStorage(), path);
            const url = await getDownloadURL(storageRef);
            pathCache.set(path, url);
            return { path, url };
          })
        );

        if (isMounted) {
          const urlMap: Record<string, { uri: string }> = {};
          results.forEach(r => {
            urlMap[r.path] = { uri: r.url };
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
