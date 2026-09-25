import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { generateDesignDirectly, GeminiDirectResponse } from './GeminiDirectService';

export interface GenerateImageOptions {
  prompt: string;
  imageBase64?: string | null;
  /** Feature type — determines which dedicated Cloud Function endpoint to call */
  featureType?: 'interior' | 'exterior' | 'garden' | 'replace' | 'newwalls' | 'newflooring' | '3dmaker';
  /** Legacy support: designType passed from older screens (maps to featureType automatically) */
  designType?: string;
  roomType?: string;
  style?: string;
  maskImageBase64?: string | null;
}

/**
 * Maps a designType string (legacy) to the new featureType enum.
 */
function resolveFeatureType(options: GenerateImageOptions): GenerateImageOptions['featureType'] | null {
  if (options.featureType) return options.featureType;
  if (options.designType) {
    switch (options.designType) {
      case 'interior':  return 'interior';
      case 'exterior':  return 'exterior';
      case 'garden':    return 'garden';
      case 'replace':   return 'replace';
      case 'newwalls':  return 'newwalls';
      case 'newflooring': return 'newflooring';
      case 'blueprint': return '3dmaker';
    }
  }
  // Auto-detect blueprint/3D from prompt keywords
  const p = options.prompt.toLowerCase();
  if (p.includes('blueprint') || p.includes('floor plan') || p.includes('3d render') || p.includes('architectural render')) {
    return '3dmaker';
  }
  return null;
}

/**
 * Shared timeout wrapper for Cloud Function calls.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs = 50000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Cloud function call timed out')), timeoutMs)
    ),
  ]);
}

/**
 * Frontend Image Generation Service — Feature-Specific Endpoint Router
 *
 * Each feature maps to a dedicated Cloud Function endpoint for isolation,
 * independent scaling, and best-practice separation of concerns.
 *
 * Endpoint Map:
 *   interior   → designInterior
 *   exterior   → designExterior
 *   garden     → designGarden
 *   newwalls   → designNewWalls
 *   newflooring → designNewFlooring
 *   replace    → designReplace
 *   3dmaker    → design3DMaker
 */
export async function generateGeminiImage(options: GenerateImageOptions): Promise<GeminiDirectResponse> {
  const { prompt, imageBase64, roomType, style, maskImageBase64 } = options;

  console.log('=== [geminiImageService] Initiating Image Generation ===');
  console.log('Prompt:', prompt);
  console.log('Model: gemini-3.6-flash (via dedicated Cloud Function)');

  const featureType = resolveFeatureType(options);
  console.log('Feature type resolved:', featureType);

  try {
    const functions = getFunctions();

    // -------------------------------------------------------------------------
    // Route to the dedicated Cloud Function endpoint for each feature
    // -------------------------------------------------------------------------
    if (featureType === 'interior' && roomType && style) {
      console.log('[geminiImageService] → Calling designInterior endpoint');
      const fn = httpsCallable(functions, 'designInterior');
      const res: any = await withTimeout(fn({ roomType, style, imageBase64 }));
      if (res?.data?.success) {
        return mapCloudResult(res.data, 'designInterior');
      }

    } else if (featureType === 'exterior' && roomType && style) {
      console.log('[geminiImageService] → Calling designExterior endpoint');
      const fn = httpsCallable(functions, 'designExterior');
      const res: any = await withTimeout(fn({ roomType, style, imageBase64 }));
      if (res?.data?.success) {
        return mapCloudResult(res.data, 'designExterior');
      }

    } else if (featureType === 'garden' && roomType && style) {
      console.log('[geminiImageService] → Calling designGarden endpoint');
      const fn = httpsCallable(functions, 'designGarden');
      const res: any = await withTimeout(fn({ roomType, style, imageBase64 }));
      if (res?.data?.success) {
        return mapCloudResult(res.data, 'designGarden');
      }

    } else if (featureType === 'newwalls' && imageBase64) {
      console.log('[geminiImageService] → Calling designNewWalls endpoint');
      const fn = httpsCallable(functions, 'designNewWalls');
      const res: any = await withTimeout(fn({ imageBase64, prompt, roomType }));
      if (res?.data?.success) {
        return mapCloudResult(res.data, 'designNewWalls');
      }

    } else if (featureType === 'newflooring' && imageBase64) {
      console.log('[geminiImageService] → Calling designNewFlooring endpoint');
      const fn = httpsCallable(functions, 'designNewFlooring');
      const res: any = await withTimeout(fn({ imageBase64, prompt, roomType }));
      if (res?.data?.success) {
        return mapCloudResult(res.data, 'designNewFlooring');
      }

    } else if (featureType === 'replace' && imageBase64) {
      console.log('[geminiImageService] → Calling designReplace endpoint');
      const fn = httpsCallable(functions, 'designReplace');
      const res: any = await withTimeout(fn({ imageBase64, prompt, maskImageBase64 }));
      if (res?.data?.success) {
        return mapCloudResult(res.data, 'designReplace');
      }

    } else if (featureType === '3dmaker' && imageBase64) {
      console.log('[geminiImageService] → Calling design3DMaker endpoint');
      const fn = httpsCallable(functions, 'design3DMaker');
      const res: any = await withTimeout(fn({ imageBase64, prompt }));
      if (res?.data?.success) {
        return mapCloudResult(res.data, 'design3DMaker');
      }
    }

  } catch (backendErr: any) {
    console.warn(
      '[geminiImageService] Cloud Function error/timeout, falling back to direct API:',
      backendErr?.message || backendErr
    );
  }

  // Fallback to direct gemini API call
  console.log('[geminiImageService] Falling back to direct GeminiDirectService...');
  return await generateDesignDirectly(imageBase64, prompt);
}

/**
 * Maps a Cloud Function response data object to the GeminiDirectResponse shape.
 */
function mapCloudResult(data: any, endpoint: string): GeminiDirectResponse {
  return {
    success: true,
    hasImage: true,
    imageDataUri: data.imageDataUri || data.downloadUrl,
    imageBase64: data.imageBase64,
    imageMimeType: data.imageMimeType || 'image/jpeg',
    status: 'success',
    message: data.message || `Generated via ${endpoint}`,
  };
}

export default {
  generateGeminiImage,
};
