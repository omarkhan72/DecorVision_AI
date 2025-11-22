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
    console.log('Gemini API key found:', geminiApiKey ? 'Yes' : 'No');

    // Initialize Gemini AI
    console.log('Initializing Gemini AI with Gemini 2.5 Flash Image Preview model...');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Using gemini-2.5-flash-image-preview for direct image generation/editing
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    console.log('Gemini model initialized successfully');

    // Process the original image
    let imageData = imageBase64;
    let imageMimeType = 'image/jpeg';
    
    if (imageBase64.startsWith('data:')) {
      // Extract mime type and base64 data from data URI
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        imageMimeType = matches[1];
        imageData = matches[2];
        console.log('Extracted image mime type:', imageMimeType);
        console.log('Image base64 data length:', imageData.length);
      } else {
        // Try to extract just base64 part if format is slightly different
        const base64Match = imageBase64.match(/base64,(.+)$/);
        if (base64Match) {
          imageData = base64Match[1];
        }
      }
    } else {
      // If it's just base64 string without data URI prefix, use it directly
      imageData = imageBase64;
      imageMimeType = 'image/jpeg';
      console.log('Using base64 string directly (assuming JPEG)');
    }

    // Prepare image parts for Gemini API
    const imageParts = [{
      inlineData: {
        data: imageData,
        mimeType: imageMimeType
      }
    }];

    // Dynamic system instructions based on targetArea
    let systemInstruction = '';
    
    if (targetArea === 'flooring') {
      systemInstruction = "You are an expert interior AI. Your task is to replace ONLY the flooring of the room with the material described in the user prompt. You must preserve the exact position of all furniture, the walls, and the ceiling. Maintain the original perspective, shadows, and lighting of the floor.";
    } else if (targetArea === 'walls') {
      systemInstruction = "You are an expert interior AI. Your task is to replace ONLY the wall finish/color with the design described in the user prompt. You must preserve the flooring, the ceiling, and all furniture exactly as they are. Ensure the new wall texture respects the existing lighting and shadows.";
    }
    
    // User prompt for the replacement
    const userPrompt = prompt.trim();
    
    // Combine system instruction with user prompt
    const fullPrompt = `${systemInstruction}\n\nUser request: ${userPrompt}\n\nPlease apply the changes to the ${targetArea} while keeping everything else in the image exactly unchanged.`;
    
    console.log('Sending new flooring/walls request to Gemini API...');
    console.log('Target area:', targetArea);
    console.log('Full prompt length:', fullPrompt.length);
    console.log('Has original image:', imageParts.length > 0);

    // Prepare content array: prompt first, then images
    const contentParts = [fullPrompt, ...imageParts];

    // Call Gemini API for image editing
    const result = await model.generateContent(contentParts);
    const response = await result.response;
    
    console.log('Gemini API response received');

    // Check if response contains images
    let generatedImageBase64 = null;
    let generatedImageMimeType = null;
    
    // The response may contain images in the parts
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        generatedImageBase64 = part.inlineData.data;
        generatedImageMimeType = part.inlineData.mimeType;
        console.log('Image found in response, mime type:', generatedImageMimeType);
        console.log('Image data length:', generatedImageBase64 ? generatedImageBase64.length : 0);
        break;
      }
    }

    // Also check for text response
    let generatedText = '';
    try {
      generatedText = response.text() || '';
      console.log('Generated text length:', generatedText.length);
    } catch (textError) {
      console.log('No text response in result');
    }

    // Log the response for debugging
    logger.info('Gemini API response', {
      hasImage: !!generatedImageBase64,
      imageMimeType: generatedImageMimeType,
      textLength: generatedText.length,
      targetArea: targetArea,
      preview: generatedText.substring(0, 200)
    });

    if (!generatedImageBase64) {
      console.warn('No image generated. Response may contain only text.');
      return {
        success: false,
        message: `${targetArea === 'flooring' ? 'Flooring' : 'Walls'} replacement failed. No image was generated. Please try again.`,
        generatedDescription: generatedText || `${targetArea === 'flooring' ? 'Flooring' : 'Walls'} replacement in progress. Please try again.`,
        hasImage: false
      };
    }

    console.log('=== New Flooring/Walls Request Completed Successfully ===');
    
    // Return the generated image as base64 data URI
    const imageDataUri = `data:${generatedImageMimeType || 'image/png'};base64,${generatedImageBase64}`;
    
    return {
      success: true,
      message: `${targetArea === 'flooring' ? 'Flooring' : 'Walls'} replacement completed successfully using Gemini 2.5 Flash Image Preview.`,
      imageDataUri: imageDataUri,
      generatedImageBase64: generatedImageBase64,
      imageMimeType: generatedImageMimeType,
      generatedDescription: generatedText || `${targetArea === 'flooring' ? 'Flooring' : 'Walls'} replacement completed successfully.`,
      hasImage: true,
      targetArea: targetArea
    };

  } catch (error) {
    console.error('=== Error in newFlooringWalls function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Error in newFlooringWalls function', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    const targetArea = request?.data?.targetArea || 'area';
    throw new Error(`${targetArea === 'flooring' ? 'Flooring' : targetArea === 'walls' ? 'Walls' : 'Image'} replacement failed: ${error.message}`);
  }
  }
);

