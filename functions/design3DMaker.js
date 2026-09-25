/**
 * design3DMaker - Dedicated Cloud Function for 3D Design Maker (Blueprint to 3D) feature
 * Accepts: imageBase64 (floor plan/blueprint image), prompt (optional custom instruction)
 * Returns: photorealistic 3D rendered floor plan image
 */

'use strict';

const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

const DEFAULT_3D_PROMPT =
  'Act as an expert 3D architectural renderer. Convert this 2D architectural floor plan into a photorealistic 3D rendered layout. ' +
  'Strictly maintain the structural integrity, walls, and room placements provided in the blueprint. ' +
  'Render it as a high-quality, fully furnished 3D isometric or top-down perspective with realistic materials, lighting, shadows, and professional finishing. ' +
  '8k resolution, cinematic architectural visualization.';

/**
 * design3DMaker Cloud Function
 * Endpoint: design3DMaker
 */
exports.design3DMaker = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 540,
    memory: '512MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      console.log('=== [design3DMaker] Request Started ===');
      const { imageBase64, prompt } = request.data;

      if (!imageBase64) {
        throw new Error('Missing required parameter: imageBase64 (blueprint/floor plan) is required');
      }

      const basePrompt = prompt && prompt.trim().length > 0 ? prompt.trim() : DEFAULT_3D_PROMPT;

      logger.info('[design3DMaker] Request', {
        hasImage: !!imageBase64,
        prompt: basePrompt,
      });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const { generateGeminiImage } = require('./services/geminiImageService');

      console.log('[design3DMaker] Generating 3D render from blueprint...');

      const result = await generateGeminiImage({
        prompt: basePrompt,
        inputImage: imageBase64,
        apiKey: geminiApiKey,
      });

      logger.info('[design3DMaker] Success', { storagePath: result.storagePath });

      return {
        success: true,
        prompt: basePrompt,
        imageDataUri: result.imageDataUri,
        downloadUrl: result.downloadUrl,
        storagePath: result.storagePath,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType || 'image/jpeg',
        hasImage: true,
        message: '3D floor plan render generated successfully.',
      };
    } catch (error) {
      console.error('[design3DMaker] Error:', error.message);
      logger.error('[design3DMaker] Error', { message: error.message });
      throw new Error(`3D design generation failed: ${error.message}`);
    }
  }
);
