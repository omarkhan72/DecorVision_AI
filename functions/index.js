/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

/**
 * Generate design prompt based on design type, room type, and style
 */
function generatePrompt(designType, roomType, style) {
  let prompt = '';

  if (designType === 'interior') {
    prompt = `Transform this ${roomType} into a ${style} style interior design. `;
    prompt += `The design should be ${style} with: `;

    switch (style) {
      case 'modern':
        prompt += 'clean lines, minimalist furniture, neutral colors with bold accents, contemporary lighting, and sleek finishes.';
        break;
      case 'cozy':
        prompt += 'warm textures, soft fabrics, comfortable seating, warm lighting, earth tones, and inviting atmosphere.';
        break;
      case 'luxury':
        prompt += 'high-end materials, elegant furniture, rich colors, sophisticated lighting, premium finishes, and opulent details.';
        break;
      case 'minimalist':
        prompt += 'simple clean spaces, neutral palette, functional furniture, uncluttered surfaces, and natural light.';
        break;
      case 'scandinavian':
        prompt += 'light wood, white walls, cozy textiles, natural elements, simple furniture, and hygge atmosphere.';
        break;
      case 'airbnb':
        prompt += 'welcoming and functional space, comfortable furniture, good lighting, neutral colors, and homey touches.';
        break;
      case 'midcentury':
        prompt += 'retro furniture, bold geometric patterns, warm wood tones, vintage accessories, and iconic mid-century pieces.';
        break;
      case 'rustic':
        prompt += 'natural materials, exposed wood, stone elements, warm colors, vintage pieces, and country charm.';
        break;
      case 'zen':
        prompt += 'peaceful atmosphere, natural materials, minimal decor, soft lighting, neutral colors, and tranquil space.';
        break;
      case 'tropical':
        prompt += 'lush plants, bright colors, natural materials, island vibes, relaxed atmosphere, and exotic touches.';
        break;
      case 'coastal':
        prompt += 'light blues and whites, nautical elements, natural textures, beach-inspired decor, and airy feel.';
        break;
      case 'vintage':
        prompt += 'antique furniture, classic patterns, warm colors, nostalgic elements, and timeless charm.';
        break;
      default:
        prompt += 'beautiful and functional design that matches the selected style.';
    }

    prompt += ` The ${roomType} should feel complete, well-designed, and professionally styled.`;

  } else if (designType === 'exterior') {
    prompt = `Transform this ${roomType} exterior into a ${style} style design. `;
    prompt += `The exterior should feature ${style} elements with: `;

    switch (style) {
      case 'modern':
        prompt += 'clean architectural lines, contemporary materials, minimalist landscaping, sleek finishes, and bold geometric shapes.';
        break;
      case 'cozy':
        prompt += 'warm materials, inviting entryway, comfortable outdoor spaces, soft lighting, and welcoming atmosphere.';
        break;
      case 'luxury':
        prompt += 'premium materials, elegant architecture, sophisticated landscaping, high-end finishes, and impressive details.';
        break;
      case 'minimalist':
        prompt += 'simple clean design, neutral colors, functional elements, uncluttered spaces, and natural materials.';
        break;
      case 'scandinavian':
        prompt += 'light colors, natural wood, simple lines, functional design, and cozy outdoor elements.';
        break;
      case 'rustic':
        prompt += 'natural stone, wood elements, country charm, warm colors, and traditional materials.';
        break;
      case 'zen':
        prompt += 'peaceful landscaping, natural elements, minimal design, tranquil spaces, and harmonious balance.';
        break;
      case 'tropical':
        prompt += 'lush vegetation, bright colors, island-inspired design, natural materials, and relaxed atmosphere.';
        break;
      case 'coastal':
        prompt += 'light colors, nautical elements, beach-inspired design, natural textures, and airy feel.';
        break;
      case 'vintage':
        prompt += 'classic architecture, traditional elements, timeless design, warm colors, and nostalgic charm.';
        break;
      default:
        prompt += 'beautiful and well-designed exterior that matches the selected style.';
    }

    prompt += ` The ${roomType} exterior should be visually appealing, well-maintained, and professionally designed.`;

  } else if (designType === 'garden') {
    prompt = `Transform this ${roomType} garden into a ${style} style garden design. `;
    prompt += `The garden should feature ${style} elements with: `;

    switch (style) {
      case 'modern':
        prompt += 'geometric layouts, contemporary planters, clean lines, minimalist design, and structured landscaping.';
        break;
      case 'cozy':
        prompt += 'comfortable seating areas, warm lighting, inviting pathways, lush greenery, and intimate spaces.';
        break;
      case 'luxury':
        prompt += 'premium materials, elegant landscaping, sophisticated design, high-end features, and impressive details.';
        break;
      case 'minimalist':
        prompt += 'simple clean design, selective plantings, neutral colors, functional spaces, and uncluttered layout.';
        break;
      case 'scandinavian':
        prompt += 'natural materials, simple design, functional elements, light colors, and cozy outdoor spaces.';
        break;
      case 'rustic':
        prompt += 'natural materials, country charm, wildflowers, traditional elements, and organic design.';
        break;
      case 'zen':
        prompt += 'peaceful atmosphere, natural elements, minimal design, tranquil spaces, water features, and harmonious balance.';
        break;
      case 'tropical':
        prompt += 'lush vegetation, exotic plants, bright colors, tropical flowers, and island paradise feel.';
        break;
      case 'coastal':
        prompt += 'beach-inspired plants, light colors, natural textures, coastal elements, and relaxed atmosphere.';
        break;
      case 'vintage':
        prompt += 'classic garden design, traditional elements, timeless plants, nostalgic charm, and heritage style.';
        break;
      default:
        prompt += 'beautiful and well-designed garden that matches the selected style.';
    }

    prompt += ` The ${roomType} garden should be beautiful, functional, and professionally landscaped.`;
  }

  return prompt;
}

/**
 * Design generation endpoint
 * Handles interior, exterior, and garden design generation using Gemini 2.5 Flash Image Preview
 * Generates images directly based on user inputs (design type, room type, style, and optional user image)
 */
exports.design = onCall(async (request) => {
  try {
    console.log('=== Design Generation Request Started ===');
    const { designType, roomType, style, imageBase64 } = request.data;

    console.log('Request data received:', {
      designType,
      roomType,
      style,
      hasImage: !!imageBase64,
      imageBase64Length: imageBase64 ? imageBase64.length : 0
    });

    // Validate required parameters
    if (!designType || !roomType || !style) {
      console.error('Validation failed: Missing required parameters', {
        hasDesignType: !!designType,
        hasRoomType: !!roomType,
        hasStyle: !!style
      });
      throw new Error('Missing required parameters: designType, roomType, and style are required');
    }

    // Validate design type
    const validDesignTypes = ['interior', 'exterior', 'garden'];
    if (!validDesignTypes.includes(designType)) {
      console.error('Validation failed: Invalid design type', { designType, validDesignTypes });
      throw new Error(`Invalid designType. Must be one of: ${validDesignTypes.join(', ')}`);
    }

    logger.info('Design generation request', {
      designType,
      roomType,
      style,
      hasImage: !!imageBase64
    });

    // Generate prompt based on design type, room type, and style
    console.log('Generating prompt...');
    const prompt = generatePrompt(designType, roomType, style);
    console.log('Generated prompt:', prompt);
    logger.info('Generated prompt', { prompt });

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY is not configured. Please set it in Firebase Functions environment variables.');
    }

    const { generateWithImagen3, enhancePromptWithImage } = require('./geminiImageHelper');

    let finalPrompt = `${prompt} Highly detailed, professional architectural photography, 8k resolution, elegant interior design, cinematic natural lighting.`;

    if (imageBase64) {
      console.log('Analyzing user uploaded room image with Gemini 2.0 Flash...');
      finalPrompt = await enhancePromptWithImage(
        geminiApiKey,
        imageBase64,
        `Transform this ${roomType} into a ${style} style ${designType} design.`
      );
      console.log('Enhanced prompt for Imagen 3:', finalPrompt);
    }

    console.log('Generating image with Imagen 3...');
    const { base64, mimeType } = await generateWithImagen3(finalPrompt, geminiApiKey);

    const imageDataUri = `data:${mimeType || 'image/jpeg'};base64,${base64}`;

    return {
      success: true,
      prompt: prompt,
      generatedDescription: finalPrompt,
      imageDataUri: imageDataUri,
      imageBase64: base64,
      imageMimeType: mimeType,
      designType: designType,
      roomType: roomType,
      style: style,
      message: 'Design image generated successfully using Imagen 3.',
      hasImage: true,
    };
  } catch (error) {
    console.error('=== Error in design function ===', error);
    logger.error('Error in design function', {
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Design generation failed: ${error.message}`);
  }
});

/**
 * Import and export the replace function
 */
exports.replace = require('./replace').replace;

/**
 * Import and export the newFlooringWalls function
 */
exports.newFlooringWalls = require('./newFlooringWalls').newFlooringWalls;

/**
 * Import and export the blueprintTo3D function
 */
exports.blueprintTo3D = require('./blueprintTo3D').blueprintTo3D;

/**
 * Import and export the deleteUserAccount function
 */
exports.deleteUserAccount = require('./deleteUserAccount').deleteUserAccount;
