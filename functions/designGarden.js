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
function buildGardenPrompt(roomType, style, hasImage = false) {
  if (hasImage) {
    let prompt = `Redesign and transform this real ${roomType} garden into a stunning, photorealistic ${style} landscape design. `;
    prompt += `Keep the original camera viewpoint, perspective, and architectural boundaries of the space, but completely renovate and upgrade all the landscaping: `;
    switch (style) {
      
      case 'modern':
        prompt += 'add geometric stone or concrete pavers, contemporary planters, architectural plantings (ornamental grasses, boxwoods), clean edges, minimalist outdoor seating, and sleek ambient lighting.';
        break;
      case 'cozy':
        prompt += 'add warm outdoor lounge seating, string lights, inviting gravel pathways, lush flowerbeds, wooden pergolas, fire pit, and intimate garden nooks.';
        break;
      case 'luxury':
        prompt += 'add premium limestone or marble paving, an elegant modern swimming pool or luxury water fountain, top-tier outdoor kitchen/lounge, manicured hedges, and high-end landscape illumination.';
        break;
      case 'minimalist':
        prompt += 'add clean open lawn, selective sculptural specimen trees, smooth gravel beds, neutral color tones, uncluttered functional layout, and understated recessed lighting.';
        break;
      case 'scandinavian':
        prompt += 'add natural light-toned timber decking, native greenery, simple wooden furniture, functional raised garden beds, and cozy outdoor hygge atmosphere.';
        break;
      case 'rustic':
        prompt += 'add natural dry-stone walls, flagstone pathways, rustic timber arbor, vibrant wildflower meadow, heritage perennial flowers, and organic natural charm.';
        break;
      case 'zen':
        prompt += 'add raked gravel rock garden, peaceful bamboo water feature (shishi-odoshi), Japanese maples, moss beds, stepping stones, and harmonious tranquil atmosphere.';
        break;
      case 'tropical':
        prompt += 'add lush tropical palm trees, giant monstera and bird of paradise plants, vibrant exotic flowers, stone water features, natural teak furniture, and an island resort paradise feel.';
        break;
      case 'coastal':
        prompt += 'add coastal ornamental grasses, weathered teak decking, sandy stone pathways, drought-tolerant seaside plants, light blue and white outdoor accents, and a breezy coastal feel.';
        break;
      case 'vintage':
        prompt += 'add classic wrought-iron garden furniture, antique stone urns, climbing roses on trellises, brick garden pathways, and timeless romantic English cottage charm.';
        break;
      default:
        prompt += 'add beautiful professional landscaping, lush plants, and stylish outdoor furniture matching the selected style.';
    }
    prompt += ' The final image must look completely realistic, as if professionally designed and photographed by an architectural landscape photographer. 8k resolution, crisp details, natural daylight.';
    return prompt;
  }

  let prompt = `Create a stunning, photorealistic ${style} style landscape design for a ${roomType} garden. `;

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

      const prompt = buildGardenPrompt(roomType, style, !!imageBase64);
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
