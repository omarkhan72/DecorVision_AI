/**
 * New Flooring/Walls function - Changes flooring or walls in interior images using Gemini AI
 * Handles flooring and wall replacement based on user prompt and target area
 */

const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {GoogleGenerativeAI} = require("@google/generative-ai");

/**
 * New Flooring/Walls endpoint
 * Changes flooring or walls in an interior image based on user prompt
 * Uses Gemini 2.5 Flash Image Preview model for image editing
 */
exports.newFlooringWalls = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 540,
    memory: '512MiB',
  },
  async (request) => {
  try {
    console.log('=== New Flooring/Walls Request Started ===');
    const { imageBase64, prompt, targetArea } = request.data;

    console.log('Request data received:', {
      hasImage: !!imageBase64,
      hasPrompt: !!prompt,
      targetArea: targetArea,
      imageBase64Length: imageBase64 ? imageBase64.length : 0,
      promptLength: prompt ? prompt.length : 0
    });

    // Validate required parameters
    if (!imageBase64) {
      console.error('Validation failed: Missing imageBase64');
      throw new Error('Missing required parameter: imageBase64 is required');
    }

    if (!prompt || prompt.trim().length === 0) {
      console.error('Validation failed: Missing or empty prompt');
      throw new Error('Missing required parameter: prompt is required');
    }

    if (!targetArea || (targetArea !== 'flooring' && targetArea !== 'walls')) {
      console.error('Validation failed: Invalid targetArea');
      throw new Error('Missing or invalid parameter: targetArea must be either "flooring" or "walls"');
    }

    logger.info('New Flooring/Walls request', {
      hasImage: !!imageBase64,
      hasPrompt: !!prompt,
      targetArea: targetArea
    });

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY is not configured. Please set it in Firebase Functions environment variables.');
    }

    const { generateWithImagen3, enhancePromptWithImage } = require('./geminiImageHelper');

    const instruction = targetArea === 'flooring'
      ? `Replace ONLY the flooring of this room with: ${prompt}. Keep all walls, ceilings, and furniture intact.`
      : `Replace ONLY the walls of this room with: ${prompt}. Keep all flooring, ceilings, and furniture intact.`;

    console.log('Analyzing room image and building transformation prompt...');
    const finalPrompt = await enhancePromptWithImage(geminiApiKey, imageBase64, instruction);

    console.log('Generating modified room with Imagen 3...');
    const { base64, mimeType } = await generateWithImagen3(finalPrompt, geminiApiKey);

    const imageDataUri = `data:${mimeType || 'image/jpeg'};base64,${base64}`;

    return {
      success: true,
      prompt: prompt,
      targetArea: targetArea,
      generatedDescription: finalPrompt,
      imageDataUri: imageDataUri,
      imageBase64: base64,
      imageMimeType: mimeType,
      message: `Room ${targetArea} successfully updated using Imagen 3.`,
      hasImage: true,
    };
  } catch (error) {
    console.error('=== Error in newFlooringWalls function ===', error);
    logger.error('Error in newFlooringWalls function', {
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Flooring/Walls update failed: ${error.message}`);
  }
});
