/**
 * designInterior - Dedicated Cloud Function for Interior Design feature
 * Accepts: designType, roomType, style, imageBase64 (optional)
 * Returns: generated interior design image
 */

'use strict';

const { onCall } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

/**
 * Build a detailed interior design prompt based on room type and style.
 */
function buildInteriorPrompt(roomType, style, hasImage = false) {
  if (hasImage) {
    let prompt = `Redesign and transform this real ${roomType} interior into a stunning, photorealistic ${style} style room design. `;
    prompt += `Maintain the original room perspective, camera angle, and architectural wall/window structure, but completely redesign the interior: replace the existing furniture, decor, lighting, wall finishes, and color palette with premium ${style} interior elements: `;
    switch (style) {
      case 'modern':
        prompt += 'sleek contemporary furniture, clean lines, neutral colors with bold accents, modern lighting fixtures, and high-end finishes.';
        break;
      case 'cozy':
        prompt += 'warm textures, plush comfortable seating, layered fabrics, soft ambient lighting, warm earth tones, and an inviting homey atmosphere.';
        break;
      case 'luxury':
        prompt += 'opulent high-end designer furniture, marble and brass accents, rich sophisticated color palette, statement chandelier lighting, and bespoke architectural details.';
        break;
      case 'minimalist':
        prompt += 'simple uncluttered spaces, functional designer furniture, neutral tones, concealed storage, and abundant clean natural light.';
        break;
      case 'scandinavian':
        prompt += 'light wood finishes, warm textiles, clean white walls, functional minimalist furniture, and a tranquil hygge ambiance.';
        break;
      case 'airbnb':
        prompt += 'stylish welcoming space, photogenic Instagram-worthy decor, comfortable seating, good ambient lighting, and practical layout.';
        break;
      case 'midcentury':
        prompt += 'iconic mid-century modern furniture, walnut and teak wood, retro geometric patterns, warm hues, and vintage designer accents.';
        break;
      case 'rustic':
        prompt += 'exposed timber beams, natural stone textures, reclaimed wood furniture, warm earthy colors, and cozy country charm.';
        break;
      case 'zen':
        prompt += 'peaceful organic minimalism, low-profile furniture, natural bamboo and light wood, soft diffused lighting, and tranquil balance.';
        break;
      case 'tropical':
        prompt += 'lush indoor palms, natural rattan and bamboo furnishings, vibrant botanical accents, and airy resort-inspired feel.';
        break;
      case 'coastal':
        prompt += 'light ocean blues and crisp whites, natural jute and linen textures, weathered wood accents, and bright breezy coastal aesthetic.';
        break;
      case 'vintage':
        prompt += 'curated antique furniture, classic wainscoting or moldings, warm nostalgic colors, ornamental frames, and timeless elegance.';
        break;
      default:
        prompt += 'beautiful designer furniture and decor perfectly suited to the selected style.';
    }
    prompt += ' The final image must look like a high-end architectural digest photograph, 8k resolution, perfectly rendered with realistic lighting.';
    return prompt;
  }

  let prompt = `Transform this ${roomType} into a stunning, photorealistic ${style} style interior design. `;

  switch (style) {
    case 'modern':
      prompt += 'Features: clean lines, minimalist furniture, neutral colors with bold accents, contemporary lighting, and sleek finishes.';
      break;
    case 'cozy':
      prompt += 'Features: warm textures, soft fabrics, comfortable seating, warm lighting, earth tones, and inviting atmosphere.';
      break;
    case 'luxury':
      prompt += 'Features: high-end materials, elegant furniture, rich colors, sophisticated lighting, premium finishes, opulent details.';
      break;
    case 'minimalist':
      prompt += 'Features: simple clean spaces, neutral palette, functional furniture, uncluttered surfaces, and natural light.';
      break;
    case 'scandinavian':
      prompt += 'Features: light wood, white walls, cozy textiles, natural elements, simple furniture, and hygge atmosphere.';
      break;
    case 'airbnb':
      prompt += 'Features: welcoming and functional space, comfortable furniture, good lighting, neutral colors, and homey touches.';
      break;
    case 'midcentury':
      prompt += 'Features: retro furniture, bold geometric patterns, warm wood tones, vintage accessories, and iconic mid-century pieces.';
      break;
    case 'rustic':
      prompt += 'Features: natural materials, exposed wood, stone elements, warm colors, vintage pieces, and country charm.';
      break;
    case 'zen':
      prompt += 'Features: peaceful atmosphere, natural materials, minimal decor, soft lighting, neutral colors, and tranquil space.';
      break;
    case 'tropical':
      prompt += 'Features: lush plants, bright colors, natural materials, island vibes, relaxed atmosphere, and exotic touches.';
      break;
    case 'coastal':
      prompt += 'Features: light blues and whites, nautical elements, natural textures, beach-inspired decor, and airy feel.';
      break;
    case 'vintage':
      prompt += 'Features: antique furniture, classic patterns, warm colors, nostalgic elements, and timeless charm.';
      break;
    default:
      prompt += 'Features: beautiful and functional design that matches the selected style.';
  }

  prompt += ` The ${roomType} should feel complete, well-designed, and professionally styled. High-end architectural photography, 8k resolution, cinematic lighting, perfectly rendered.`;
  return prompt;
}

/**
 * designInterior Cloud Function
 * Endpoint: designInterior
 */
exports.designInterior = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 300,
    memory: '512MiB',
    enforceAppCheck: false,
  },
  async (request) => {
    try {
      console.log('=== [designInterior] Request Started ===');
      const { roomType, style, imageBase64 } = request.data;

      // Validate required parameters
      if (!roomType || !style) {
        throw new Error('Missing required parameters: roomType and style are required');
      }

      logger.info('[designInterior] Request', { roomType, style, hasImage: !!imageBase64 });

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }

      const { generateGeminiImage } = require('./services/geminiImageService');

      const prompt = buildInteriorPrompt(roomType, style, !!imageBase64);
      console.log('[designInterior] Prompt:', prompt);

      const result = await generateGeminiImage({
        prompt,
        inputImage: imageBase64,
        apiKey: geminiApiKey,
      });

      logger.info('[designInterior] Success', { storagePath: result.storagePath });

      return {
        success: true,
        prompt,
        imageDataUri: result.imageDataUri,
        downloadUrl: result.downloadUrl,
        storagePath: result.storagePath,
        imageBase64: result.imageBase64,
        imageMimeType: result.imageMimeType || 'image/jpeg',
        designType: 'interior',
        roomType,
        style,
        hasImage: true,
        message: 'Interior design image generated successfully.',
      };
    } catch (error) {
      console.error('[designInterior] Error:', error.message);
      logger.error('[designInterior] Error', { message: error.message });
      throw new Error(`Interior design generation failed: ${error.message}`);
    }
  }
);
