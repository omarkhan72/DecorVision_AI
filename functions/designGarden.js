/**
 * designGarden - Dedicated Cloud Function for Garden Design feature
 * Accepts: roomType (garden/outdoor area type), style, imageBase64 (optional)
 * Returns: generated garden design image
 */

'use strict';

const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

/**
 * Build a detailed garden design prompt based on garden type and style.
 */
function buildGardenPrompt(roomType, style) {
  let prompt = `Transform this ${roomType} garden into a stunning, photorealistic ${style} style landscape design. `;

  switch (style) {
    case 'modern':
      prompt += 'Features: geometric layouts, contemporary planters, clean lines, minimalist design, and structured landscaping.';
      break;
    case 'cozy':
      prompt += 'Features: comfortable seating areas, warm lighting, inviting pathways, lush greenery, and intimate spaces.';
      break;
    case 'luxury':
      prompt += 'Features: premium materials, elegant landscaping, sophisticated design, high-end water features, and impressive details.';
      break;
    case 'minimalist':
      prompt += 'Features: simple clean design, selective plantings, neutral colors, functional spaces, and uncluttered layout.';
      break;
    case 'scandinavian':
      prompt += 'Features: natural materials, simple design, functional elements, light colors, and cozy outdoor spaces.';
      break;
    case 'rustic':
      prompt += 'Features: natural materials, country charm, wildflowers, traditional elements, and organic design.';
      break;
    case 'zen':
      prompt += 'Features: peaceful atmosphere, natural elements, minimal design, tranquil spaces, water features, and harmonious balance.';
      break;
    case 'tropical':
      prompt += 'Features: lush vegetation, exotic plants, bright tropical flowers, and island paradise feel.';
      break;
    case 'coastal':
      prompt += 'Features: beach-inspired plants, light colors, natural textures, coastal elements, and relaxed atmosphere.';
      break;
    case 'vintage':
      prompt += 'Features: classic garden design, traditional elements, timeless plants, nostalgic charm, and heritage style.';
      break;
    default:
      prompt += 'Features: beautiful and well-designed garden that matches the selected style.';
  }

  prompt += ` The ${roomType} garden should be beautiful, functional, and professionally landscaped. High-quality outdoor photography, 8k resolution, natural sunlight, perfectly rendered.`;
  return prompt;
}

/**
 * designGarden Cloud Function
 * Endpoint: designGarden
 */
exports.designGarden = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 300,
    memory: '512MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      console.log('=== [designGarden] Request Started ===');
      const { roomType, style, imageBase64 } = request.data;

      if (!roomType || !style) {
        throw new Error('Missing required parameters: roomType and style are required');
      }

      logger.info('[designGarden] Request', { roomType, style, hasImage: !!imageBase64 });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const { generateGeminiImage } = require('./services/geminiImageService');

      const prompt = buildGardenPrompt(roomType, style);
      console.log('[designGarden] Prompt:', prompt);

      const result = await generateGeminiImage({
        prompt,
        inputImage: imageBase64,
        apiKey: geminiApiKey,
      });

      logger.info('[designGarden] Success', { storagePath: result.storagePath });

      return {
        success: true,
        prompt,
        imageDataUri: result.imageDataUri,
        downloadUrl: result.downloadUrl,
        storagePath: result.storagePath,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType || 'image/jpeg',
        designType: 'garden',
        roomType,
        style,
        hasImage: true,
        message: 'Garden design image generated successfully.',
      };
    } catch (error) {
      console.error('[designGarden] Error:', error.message);
      logger.error('[designGarden] Error', { message: error.message });
      throw new Error(`Garden design generation failed: ${error.message}`);
    }
  }
);
