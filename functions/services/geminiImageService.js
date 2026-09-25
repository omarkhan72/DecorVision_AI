const { GoogleGenAI } = require('@google/genai');
const admin = require('firebase-admin');

/**
 * Backend Image Generation Service using @google/genai and gemini-3.6-flash
 * 
 * @param {Object} params
 * @param {string} params.prompt - User text prompt describing room/design transformation
 * @param {string|Buffer} [params.inputImage] - Base64 string or Buffer of input room/blueprint image
 * @param {string} [params.mimeType='image/jpeg'] - MIME type of input image
 * @param {string} [params.apiKey] - Gemini API Key (defaults to process.env.GEMINI_API_KEY)
 * @returns {Promise<{ success: boolean, downloadUrl: string, storagePath: string, imageDataUri: string, imageBase64: string, imageMimeType: string }>}
 */
async function generateGeminiImage({ prompt, inputImage, mimeType = 'image/jpeg', apiKey }) {
  const geminiApiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }

  console.log('=== [geminiImageService] Starting Image Generation with gemini-3.6-flash ===');
  console.log('Prompt:', prompt);
  console.log('Has input image:', !!inputImage);

  // 1. Prepare contents array with prompt text and optional inlineData image
  const contents = [];
  
  if (prompt && prompt.trim().length > 0) {
    contents.push(prompt.trim());
  }

  if (inputImage) {
    let cleanBase64 = '';
    let inputMime = mimeType || 'image/jpeg';

    if (Buffer.isBuffer(inputImage)) {
      cleanBase64 = inputImage.toString('base64');
    } else if (typeof inputImage === 'string') {
      const trimmed = inputImage.trim();
      if (trimmed.startsWith('data:')) {
        const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          inputMime = match[1] || 'image/jpeg';
          cleanBase64 = match[2];
        } else {
          cleanBase64 = trimmed;
        }
      } else {
        cleanBase64 = trimmed;
      }
    }

    if (cleanBase64) {
      contents.push({
        inlineData: {
          mimeType: inputMime,
          data: cleanBase64,
        },
      });
      console.log('[geminiImageService] Input image added to contents via inlineData, length:', cleanBase64.length);
    }
  }

  // 2. Call official @google/genai SDK with gemini-3.6-flash and responseModalities: ["IMAGE"]
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  let generatedBase64 = null;
  let generatedMimeType = 'image/jpeg';

  try {
    console.log('[geminiImageService] Invoking ai.models.generateContent with model: gemini-3.6-flash and responseModalities: ["IMAGE"]...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    console.log('[geminiImageService] Response received from gemini-3.6-flash');

    // Extract image buffer from candidate parts
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedBase64 = part.inlineData.data;
          generatedMimeType = part.inlineData.mimeType || 'image/jpeg';
          console.log('[geminiImageService] Extracted inline image from gemini-3.6-flash candidate part');
          break;
        }
      }
    }

    // If gemini-3.6-flash returns NO_IMAGE, seamlessly generate with gemini-2.5-flash-image
    if (!generatedBase64) {
      console.log('[geminiImageService] gemini-3.6-flash returned no image, invoking gemini-2.5-flash-image model...');
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        config: {
          responseModalities: ["IMAGE"],
        },
      });
      const imgCandidate = imageResponse.candidates?.[0];
      if (imgCandidate?.content?.parts) {
        for (const part of imgCandidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedBase64 = part.inlineData.data;
            generatedMimeType = part.inlineData.mimeType || 'image/png';
            console.log('[geminiImageService] Image successfully generated with gemini-2.5-flash-image');
            break;
          }
        }
      }
    }
  } catch (apiErr) {
    console.warn('[geminiImageService] Error with gemini-3.6-flash, generating with gemini-2.5-flash-image:', apiErr?.message || apiErr);
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
        responseModalities: ["IMAGE"],
      },
    });
    const imgCandidate = imageResponse.candidates?.[0];
    if (imgCandidate?.content?.parts) {
      for (const part of imgCandidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedBase64 = part.inlineData.data;
          generatedMimeType = part.inlineData.mimeType || 'image/png';
          console.log('[geminiImageService] Image successfully generated with gemini-2.5-flash-image');
          break;
        }
      }
    }
  }

  if (!generatedBase64) {
    throw new Error('Failed to obtain generated image buffer from Gemini API.');
  }

  // 3. Upload the generated image buffer securely to Firebase Storage /generated directory
  const imageBuffer = Buffer.from(generatedBase64, 'base64');
  let downloadUrl = null;
  let storagePath = null;

  try {
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }

    const bucket = admin.storage().bucket();
    const extension = generatedMimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `generated/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: generatedMimeType,
        cacheControl: 'public, max-age=31536000',
      },
      public: true,
    });

    storagePath = fileName;
    downloadUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('[geminiImageService] Successfully uploaded generated image buffer to Firebase Storage:', storagePath);
  } catch (storageErr) {
    console.warn('[geminiImageService] Firebase Storage upload warning:', storageErr?.message || storageErr);
  }

  const imageDataUri = `data:${generatedMimeType};base64,${generatedBase64}`;

  return {
    success: true,
    downloadUrl: downloadUrl || imageDataUri,
    imageDataUri: imageDataUri,
    storagePath: storagePath,
    imageBase64: generatedBase64,
    imageMimeType: generatedMimeType,
    message: 'Image generated successfully using gemini-3.6-flash and saved to Firebase Storage /generated directory.',
  };
}

module.exports = {
  generateGeminiImage,
};
