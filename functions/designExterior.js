/**
 * designExterior - Dedicated Cloud Function for Exterior Design feature
 * Accepts: roomType (building/house type), style, imageBase64 (optional)
 * Returns: generated exterior design image
 */

'use strict';

const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

/**
 * Build a detailed exterior design prompt based on building type and style.
 */
function buildExteriorPrompt(roomType, style, hasImage = false) {
  if (hasImage) {
    let prompt = `Redesign and renovate this real ${roomType} exterior into a stunning, photorealistic ${style} architectural masterpiece. `;
    prompt += `Keep the original building footprint, camera angle, and perspective, but completely upgrade the exterior facade, materials, siding, roofing, windows, front entryway, exterior lighting, and landscaping to match the ${style} architectural style: `;
    switch (style) {
      case 'modern':
        prompt += 'smooth stucco or architectural panels, large glass windows, clean geometric rooflines, contemporary dark accents, and minimalist modern landscaping.';
        break;
      case 'cozy':
        prompt += 'warm exterior materials, inviting front porch, welcoming entryway, charming window trim, warm exterior lighting, and cottage landscaping.';
        break;
      case 'luxury':
        prompt += 'premium natural stone cladding, grand entry, bespoke architectural lighting, high-end roof finishes, manicured estate landscaping, and stunning curb appeal.';
        break;
      case 'minimalist':
        prompt += 'monochromatic color palette, seamless cladding, hidden gutters, sleek modern windows, and pristine architectural simplicity.';
        break;
      case 'scandinavian':
        prompt += 'light natural timber cladding, crisp white or dark contrast elements, clean vertical lines, and simple Nordic architectural details.';
        break;
      case 'rustic':
        prompt += 'natural fieldstone facade, heavy timber porch posts, cedar shake or board-and-batten siding, and natural organic charm.';
        break;
      case 'zen':
        prompt += 'harmonious natural wood slats, dark metal accents, peaceful stone entryway, Japanese landscape elements, and balanced proportions.';
        break;
      case 'tropical':
        prompt += 'island-inspired exterior, louvered shutters, lush tropical garden surroundings, natural stone walkways, and resort-style facade.';
        break;
      case 'coastal':
        prompt += 'shingle or weatherboard siding in coastal tones, white trim, expansive windows capturing light, and beachside landscape plants.';
        break;
      case 'vintage':
        prompt += 'historic architectural charm, detailed cornices and window surrounds, classic front porch, and timeless heritage elegance.';
        break;
      default:
        prompt += 'beautiful exterior renovations and professional curb appeal matching the selected style.';
    }
    prompt += ' High-end architectural photography, 8k resolution, golden hour lighting, perfectly rendered.';
    return prompt;
  }

  let prompt = `Transform this ${roomType} exterior into a stunning, photorealistic ${style} style architectural design. `;

  switch (style) {
    case 'modern':
      prompt += 'Features: clean architectural lines, contemporary materials, minimalist landscaping, sleek finishes, and bold geometric shapes.';
      break;
    case 'cozy':
      prompt += 'Features: warm materials, inviting entryway, comfortable outdoor spaces, soft lighting, and welcoming atmosphere.';
      break;
    case 'luxury':
      prompt += 'Features: premium materials, elegant architecture, sophisticated landscaping, high-end finishes, and impressive curb appeal.';
      break;
    case 'minimalist':
      prompt += 'Features: simple clean design, neutral colors, functional elements, uncluttered spaces, and natural materials.';
      break;
    case 'scandinavian':
      prompt += 'Features: light colors, natural wood, simple lines, functional design, and cozy outdoor elements.';
      break;
    case 'rustic':
      prompt += 'Features: natural stone, wood elements, country charm, warm colors, and traditional craftsmanship.';
      break;
    case 'zen':
      prompt += 'Features: peaceful landscaping, natural elements, minimal design, tranquil spaces, and harmonious balance.';
      break;
    case 'tropical':
      prompt += 'Features: lush vegetation, bright colors, island-inspired design, natural materials, and relaxed atmosphere.';
      break;
    case 'coastal':
      prompt += 'Features: light colors, nautical elements, beach-inspired design, natural textures, and airy feel.';
      break;
    case 'vintage':
      prompt += 'Features: classic architecture, traditional elements, timeless design, warm colors, and nostalgic charm.';
      break;
    default:
      prompt += 'Features: beautiful and well-designed exterior that matches the selected style.';
  }

  prompt += ` The ${roomType} exterior should be visually appealing, well-maintained, and professionally designed. High-end architectural photography, 8k resolution, golden hour lighting, perfectly rendered.`;
  return prompt;
}

/**
 * designExterior Cloud Function
 * Endpoint: designExterior
 */
exports.designExterior = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 300,
    memory: '512MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      console.log('=== [designExterior] Request Started ===');
      const { roomType, style, imageBase64 } = request.data;

      if (!roomType || !style) {
        throw new Error('Missing required parameters: roomType and style are required');
      }

      logger.info('[designExterior] Request', { roomType, style, hasImage: !!imageBase64 });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const { generateGeminiImage } = require('./services/geminiImageService');

      const prompt = buildExteriorPrompt(roomType, style, !!imageBase64);
      console.log('[designExterior] Prompt:', prompt);

      const result = await generateGeminiImage({
        prompt,
        inputImage: imageBase64,
        apiKey: geminiApiKey,
      });

      logger.info('[designExterior] Success', { storagePath: result.storagePath });

      return {
        success: true,
        prompt,
        imageDataUri: result.imageDataUri,
        downloadUrl: result.downloadUrl,
        storagePath: result.storagePath,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType || 'image/jpeg',
        designType: 'exterior',
        roomType,
        style,
        hasImage: true,
        message: 'Exterior design image generated successfully.',
      };
    } catch (error) {
      console.error('[designExterior] Error:', error.message);
      logger.error('[designExterior] Error', { message: error.message });
      throw new Error(`Exterior design generation failed: ${error.message}`);
    }
  }
);
