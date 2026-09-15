import RNFS from 'react-native-fs';

/**
 * Shared image utility functions.
 * Centralizes image conversion logic.
 */

/**
 * Convert an image URI to a base64 data URI string.
 * Handles file://, content://, http://, https://, and data: URIs.
 */
export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    if (!uri) return null;

    // If already base64, return as is
    if (uri.startsWith('data:')) {
      return uri;
    }

    // Handle file:// and content:// with RNFS
    if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('/')) {
      try {
        const filePath = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
        const base64 = await RNFS.readFile(filePath, 'base64');
        if (base64) {
          return `data:image/jpeg;base64,${base64}`;
        }
      } catch (fsErr) {
        console.warn('RNFS.readFile failed, falling back to fetch/blob:', fsErr);
      }
    }

    // Fallback: Use fetch & FileReader for http/https or unresolved URIs
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          console.warn('FileReader error');
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (fetchErr) {
      console.warn('Fetch blob conversion failed:', fetchErr);
    }

    return null;
  } catch (error: any) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

