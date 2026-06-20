/**
 * Shared image utility functions.
 * Centralizes image conversion logic that was previously duplicated
 * across HomeScreen, InteriorStyleSelectionScreen, NewFlooringStyleSelectionScreen,
 * and NewWallsStyleSelectionScreen.
 */

/**
 * Convert an image URI to a base64 data URI string.
 * Handles file://, content://, http://, https://, and data: URIs.
 */
export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // If already base64, return as is
    if (uri.startsWith('data:')) {
      return uri;
    }

    // Use XMLHttpRequest for file:// and content:// URIs (works in React Native)
    if (uri.startsWith('file://') || uri.startsWith('content://')) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
          if (xhr.status === 200) {
            const reader = new FileReader();
            reader.onloadend = function () {
              resolve(reader.result as string);
            };
            reader.onerror = function () {
              console.warn('FileReader error, returning URI as-is');
              resolve(uri);
            };
            reader.readAsDataURL(xhr.response);
          } else {
            console.warn('XMLHttpRequest failed, returning URI as-is');
            resolve(uri);
          }
        };
        xhr.onerror = function () {
          console.warn('XMLHttpRequest error, returning URI as-is');
          resolve(uri);
        };
        xhr.send();
      });
    }

    // Use XMLHttpRequest for http/https URIs (works in React Native)
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', uri, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
          if (xhr.status === 200) {
            const reader = new FileReader();
            reader.onloadend = function () {
              resolve(reader.result as string);
            };
            reader.onerror = function () {
              console.warn('FileReader error, returning URI as-is');
              resolve(uri);
            };
            reader.readAsDataURL(xhr.response);
          } else {
            console.warn('XMLHttpRequest failed, returning URI as-is');
            resolve(uri);
          }
        };
        xhr.onerror = function () {
          console.warn('XMLHttpRequest error, returning URI as-is');
          resolve(uri);
        };
        xhr.send();
      });
    }

    // Fallback: return the URI as-is and let backend handle it
    console.warn('Unsupported URI format, returning URI as-is');
    return uri;
  } catch (error: any) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};
