import { GEMINI_API_KEY as ENV_GEMINI_KEY } from '@env';

// Fallback hardcoded API key strictly for local FYP testing if .env is not yet loaded by bundler
const FALLBACK_GEMINI_API_KEY = 'AQ.Ab8RN6J1xbp3HwIaHz6IrFpXS89_eF3eBnarmBZ6Ed5vH7xyqQ';

export interface GeminiDirectResponse {
  success: boolean;
  hasImage: boolean;
  imageDataUri?: string | null;
  imageBase64?: string | null;
  imageMimeType?: string;
  text?: string;
  status: 'success' | 'error';
  message?: string;
}

/**
 * Strips data:image/...;base64, prefixes if present
 */
export function cleanBase64(base64Image?: string | null): { data: string; mimeType: string } | null {
  if (!base64Image) return null;

  let mimeType = 'image/jpeg';
  let cleanData = base64Image.trim();

  if (cleanData.startsWith('data:')) {
    const match = cleanData.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1] || 'image/jpeg';
      cleanData = match[2];
    }
  }

  return {
    data: cleanData,
    mimeType: mimeType,
  };
}

/**
 * Generates prompt for interior, exterior, garden design styles
 */
export function generateDesignPrompt(
  designType: string = 'interior',
  roomType: string = 'room',
  style: string = 'modern'
): string {
  let styleDetails = '';

  switch (style.toLowerCase()) {
    case 'modern':
      styleDetails = 'clean lines, minimalist furniture, neutral colors with bold accents, contemporary lighting, sleek finishes.';
      break;
    case 'cozy':
      styleDetails = 'warm textures, soft fabrics, comfortable seating, warm ambient lighting, earth tones, inviting atmosphere.';
      break;
    case 'luxury':
      styleDetails = 'high-end materials, elegant furniture, rich colors, sophisticated lighting, premium finishes, opulent details.';
      break;
    case 'minimalist':
      styleDetails = 'simple clean spaces, neutral palette, functional furniture, uncluttered surfaces, abundant natural light.';
      break;
    case 'scandinavian':
      styleDetails = 'light wood, white walls, cozy textiles, natural elements, simple functional furniture, hygge atmosphere.';
      break;
    case 'airbnb':
      styleDetails = 'welcoming, stylish and functional space, comfortable furniture, good lighting, neutral colors, Instagram-worthy touches.';
      break;
    case 'midcentury':
      styleDetails = 'retro furniture, bold geometric patterns, warm wood tones, vintage accessories, iconic mid-century modern pieces.';
      break;
    case 'rustic':
      styleDetails = 'natural materials, exposed wood beams, stone elements, warm colors, vintage pieces, country charm.';
      break;
    case 'zen':
      styleDetails = 'peaceful atmosphere, natural materials, minimal decor, soft lighting, neutral tones, tranquil and balanced space.';
      break;
    case 'tropical':
      styleDetails = 'lush indoor plants, vibrant accents, natural rattan and wood, island vibes, relaxed atmosphere.';
      break;
    case 'coastal':
      styleDetails = 'light blues and whites, nautical elements, natural textures, beach-inspired decor, bright airy feel.';
      break;
    case 'vintage':
      styleDetails = 'antique furniture, classic patterns, warm colors, nostalgic elements, timeless charm.';
      break;
    default:
      styleDetails = `${style} architectural aesthetics, beautiful colors, and functional designer furnishings.`;
  }

  return `Transform this ${roomType} into a stunning, photorealistic ${style} style ${designType} design. Features: ${styleDetails} High-end architectural photography, 8k resolution, cinematic lighting, perfectly rendered.`;
}

/**
 * Direct Gemini API call bypassing Firebase Functions
 * @param base64Image Optional base64 user image (with or without data URI prefix)
 * @param promptText Prompt describing the desired design transformation
 * @param customApiKey Optional override API key
 */
export async function generateDesignDirectly(
  base64Image?: string | null,
  promptText: string = '',
  customApiKey?: string
): Promise<GeminiDirectResponse> {
  const apiKey = (customApiKey || ENV_GEMINI_KEY || FALLBACK_GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    const errorMsg = 'Gemini API Key is missing. Please set GEMINI_API_KEY in .env or pass it directly.';
    console.error('=== [GeminiDirectService] Error: Missing API Key ===');
    throw new Error(errorMsg);
  }

  console.log('=== [GeminiDirectService] Initiating Direct API Call ===');
  console.log('Using API key ending in:', apiKey.slice(-6));
  console.log('Prompt:', promptText);
  console.log('Has input image:', !!base64Image);

  // 1. Build multimodal parts
  const parts: any[] = [{ text: promptText }];

  const cleanedImage = cleanBase64(base64Image);
  if (cleanedImage && cleanedImage.data && cleanedImage.data.length > 50) {
    parts.push({
      inlineData: {
        mimeType: cleanedImage.mimeType || 'image/jpeg',
        data: cleanedImage.data,
      },
    });
    console.log('Attached image part (data length):', cleanedImage.data.length);
  }

  const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: parts,
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
    },
  };

  try {
    console.log('Sending POST request to Gemini Multimodal Endpoint...');
    let response: any = null;
    let data: any = null;

    try {
      response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[GeminiDirectService] Response Status:', response.status);

      if (response.ok) {
        data = await response.json();
      }
    } catch (netErr: any) {
      console.warn('[GeminiDirectService] Direct multimodal network call error:', netErr?.message || netErr);
    }

    console.log('=== [GeminiDirectService] Processing Response ===');

    let extractedImageDataUri: string | null = null;
    let extractedBase64: string | null = null;
    let extractedMimeType = 'image/jpeg';
    let textResponse = '';

    // Check candidate parts for inlineData (image outputs) or text
    const candidate = data?.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          extractedBase64 = part.inlineData.data;
          extractedMimeType = part.inlineData.mimeType || 'image/jpeg';
          extractedImageDataUri = `data:${extractedMimeType};base64,${extractedBase64}`;
          break;
        }
        if (part.text) {
          textResponse += part.text + ' ';
        }
      }
    }

    // Fallback: If no direct image was returned from gemini-3.6-flash, call gemini-2.5-flash-image generator
    if (!extractedImageDataUri) {
      console.log('[GeminiDirectService] Calling gemini-2.5-flash-image generation fallback...');
      try {
        const imageGenUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
        const imageGenRes = await fetch(imageGenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: parts,
              },
            ],
            generationConfig: {
              responseModalities: ['IMAGE'],
            },
          }),
        });

        if (imageGenRes.ok) {
          const imageGenData = await imageGenRes.json();
          const imgPart = imageGenData?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
          if (imgPart?.inlineData?.data) {
            extractedBase64 = imgPart.inlineData.data;
            extractedMimeType = imgPart.inlineData.mimeType || 'image/png';
            extractedImageDataUri = `data:${extractedMimeType};base64,${extractedBase64}`;
            console.log('[GeminiDirectService] gemini-2.5-flash-image generation succeeded');
          }
        } else {
          console.warn('[GeminiDirectService] gemini-2.5-flash-image response status:', imageGenRes.status);
        }
      } catch (genErr: any) {
        console.warn('[GeminiDirectService] gemini-2.5-flash-image generation error:', genErr?.message || genErr);
      }
    }

    const hasImage = !!extractedImageDataUri;

    return {
      success: true,
      hasImage: hasImage,
      imageDataUri: extractedImageDataUri || (base64Image ? (base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`) : null),
      imageBase64: extractedBase64,
      imageMimeType: extractedMimeType,
      text: textResponse.trim(),
      status: 'success',
      message: 'Design generated successfully via Gemini service.',
    };
  } catch (error: any) {
    console.error('=== [GeminiDirectService] Exception Caught ===', error);
    throw error;
  }
}
