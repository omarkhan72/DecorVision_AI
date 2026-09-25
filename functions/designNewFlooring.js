/**
 * designNewFlooring - Dedicated Cloud Function for New Flooring feature
 * Accepts: imageBase64, prompt (flooring style/material description), roomType (optional)
 * Returns: generated room image with new flooring applied
 */

'use strict';

const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

/**
 * designNewFlooring Cloud Function
 * Endpoint: designNewFlooring
 */
exports.designNewFlooring = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 540,
    memory: '512MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      console.log('=== [designNewFlooring] Request Started ===');
      const { imageBase64, prompt, roomType } = request.data;

      if (!imageBase64) {
        throw new Error('Missing required parameter: imageBase64 is required');
      }
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Missing required parameter: prompt (flooring style description) is required');
      }

      logger.info('[designNewFlooring] Request', {
        hasImage: !!imageBase64,
        hasPrompt: !!prompt,
        roomType,
      });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const { generateGeminiImage } = require('./services/geminiImageService');

      const instruction = `Replace ONLY the flooring of this ${roomType || 'room'} with: ${prompt.trim()}. Keep all walls, ceilings, furniture, and fixtures completely intact and unchanged. Maintain the exact same room perspective, lighting conditions, and architectural structure. Photorealistic interior photography, 8k resolution, professional quality.`;

      console.log('[designNewFlooring] Instruction:', instruction);

      const result = await generateGeminiImage({
        prompt: instruction,
        inputImage: imageBase64,
        apiKey: geminiApiKey,
      });

      logger.info('[designNewFlooring] Success', { storagePath: result.storagePath });

      return {
        success: true,
        prompt,
        instruction,
        imageDataUri: result.imageDataUri,
        downloadUrl: result.downloadUrl,
        storagePath: result.storagePath,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType || 'image/jpeg',
        targetArea: 'flooring',
        hasImage: true,
        message: 'Room flooring updated successfully.',
      };
    } catch (error) {
      console.error('[designNewFlooring] Error:', error.message);
      logger.error('[designNewFlooring] Error', { message: error.message });
      throw new Error(`New flooring generation failed: ${error.message}`);
    }
  }
);
