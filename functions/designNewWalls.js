/**
 * designNewWalls - Dedicated Cloud Function for New Walls feature
 * Accepts: imageBase64, prompt (wall style/material description), roomType (optional)
 * Returns: generated room image with new walls applied
 */

'use strict';

const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

/**
 * designNewWalls Cloud Function
 * Endpoint: designNewWalls
 */
exports.designNewWalls = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 540,
    memory: '512MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      console.log('=== [designNewWalls] Request Started ===');
      const { imageBase64, prompt, roomType } = request.data;

      if (!imageBase64) {
        throw new Error('Missing required parameter: imageBase64 is required');
      }
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Missing required parameter: prompt (wall style description) is required');
      }

      logger.info('[designNewWalls] Request', {
        hasImage: !!imageBase64,
        hasPrompt: !!prompt,
        roomType,
      });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const { generateGeminiImage } = require('./services/geminiImageService');

      const instruction = `Replace ONLY the walls of this ${roomType || 'room'} with: ${prompt.trim()}. Keep all flooring, ceilings, furniture, and fixtures completely intact and unchanged. Maintain the exact same room perspective, lighting conditions, and architectural structure. Photorealistic interior photography, 8k resolution, professional quality.`;

      console.log('[designNewWalls] Instruction:', instruction);

      const result = await generateGeminiImage({
        prompt: instruction,
        inputImage: imageBase64,
        apiKey: geminiApiKey,
      });

      logger.info('[designNewWalls] Success', { storagePath: result.storagePath });

      return {
        success: true,
        prompt,
        instruction,
        imageDataUri: result.imageDataUri,
        downloadUrl: result.downloadUrl,
        storagePath: result.storagePath,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType || 'image/jpeg',
        targetArea: 'walls',
        hasImage: true,
        message: 'Room walls updated successfully.',
      };
    } catch (error) {
      console.error('[designNewWalls] Error:', error.message);
      logger.error('[designNewWalls] Error', { message: error.message });
      throw new Error(`New walls generation failed: ${error.message}`);
    }
  }
);
