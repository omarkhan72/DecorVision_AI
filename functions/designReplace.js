/**
 * designReplace - Dedicated Cloud Function for Object Replace feature
 * Accepts: imageBase64, prompt (description of replacement), maskImageBase64 (optional)
 * Returns: generated image with the requested object replaced
 */

'use strict';

const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

/**
 * designReplace Cloud Function
 * Endpoint: designReplace
 */
exports.designReplace = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 540,
    memory: '512MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      console.log('=== [designReplace] Request Started ===');
      const { imageBase64, prompt, maskImageBase64 } = request.data;

      if (!imageBase64) {
        throw new Error('Missing required parameter: imageBase64 is required');
      }
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Missing required parameter: prompt is required');
      }

      logger.info('[designReplace] Request', {
        hasImage: !!imageBase64,
        hasPrompt: !!prompt,
        hasMask: !!maskImageBase64,
      });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const { generateGeminiImage } = require('./services/geminiImageService');

      const instruction = `Replace or modify the specified object/area in this room according to the instruction: "${prompt.trim()}". Seamlessly blend the replacement with the surrounding lighting, materials, perspective, and shadows. Keep all other elements of the room intact and unchanged. Photorealistic interior photography, 8k resolution, professional architectural photography.`;

      console.log('[designReplace] Instruction:', instruction);

      const result = await generateGeminiImage({
        prompt: instruction,
        inputImage: imageBase64,
        apiKey: geminiApiKey,
      });

      logger.info('[designReplace] Success', { storagePath: result.storagePath });

      return {
        success: true,
        prompt,
        instruction,
        imageDataUri: result.imageDataUri,
        downloadUrl: result.downloadUrl,
        storagePath: result.storagePath,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType || 'image/jpeg',
        hasImage: true,
        message: 'Object replacement completed successfully.',
      };
    } catch (error) {
      console.error('[designReplace] Error:', error.message);
      logger.error('[designReplace] Error', { message: error.message });
      throw new Error(`Object replacement failed: ${error.message}`);
    }
  }
);
