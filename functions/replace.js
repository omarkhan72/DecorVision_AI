/**
 * Replace function - Replaces objects in images using Gemini AI
 * Handles image replacement based on user prompt and optional mask
 */

const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {GoogleGenerativeAI} = require("@google/generative-ai");

/**
 * Replace endpoint
 * Replaces objects in an image based on user prompt and optional mask
 * Uses Gemini 2.5 Flash Image Preview model for image editing
 */
exports.replace = onCall(async (request) => {
  try {
    console.log('=== Replace Request Started ===');
    const { imageBase64, prompt, maskImageBase64 } = request.data;

    console.log('Request data received:', {
      hasImage: !!imageBase64,
      hasPrompt: !!prompt,
      hasMask: !!maskImageBase64,
      imageBase64Length: imageBase64 ? imageBase64.length : 0,
      promptLength: prompt ? prompt.length : 0,
      maskImageBase64Length: maskImageBase64 ? maskImageBase64.length : 0
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

    logger.info('Replace request', {
      hasImage: !!imageBase64,
      hasPrompt: !!prompt,
      hasMask: !!maskImageBase64
    });

    // Get Gemini API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY is not configured. Please set it in Firebase Functions environment variables.');
    }

    const { generateWithImagen3, enhancePromptWithImage } = require('./geminiImageHelper');

    console.log('Analyzing replacement target and creating prompt with Gemini...');
    const finalPrompt = await enhancePromptWithImage(
      geminiApiKey,
      imageBase64,
      `Replace or modify the object in this room according to this instruction: ${prompt}. Preserve the rest of the room architecture, perspective, and lighting.`
    );

    console.log('Generating modified image with Imagen 3...');
    const { base64, mimeType } = await generateWithImagen3(finalPrompt, geminiApiKey);

    const imageDataUri = `data:${mimeType || 'image/jpeg'};base64,${base64}`;

    return {
      success: true,
      prompt: prompt,
      generatedDescription: finalPrompt,
      imageDataUri: imageDataUri,
      imageBase64: base64,
      imageMimeType: mimeType,
      message: 'Object replacement completed successfully using Imagen 3.',
      hasImage: true,
    };
  } catch (error) {
    console.error('=== Error in replace function ===', error);
    logger.error('Error in replace function', {
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Replacement failed: ${error.message}`);
  }
});
