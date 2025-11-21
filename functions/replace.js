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

    // Process mask image if provided
    if (maskImageBase64) {
      try {
        console.log('Processing mask image...');
        let maskData = maskImageBase64;
        let maskMimeType = 'image/png';
        
        if (maskImageBase64.startsWith('data:')) {
          const maskMatches = maskImageBase64.match(/^data:([^;]+);base64,(.+)$/);
          if (maskMatches) {
            maskMimeType = maskMatches[1];
            maskData = maskMatches[2];
            console.log('Extracted mask mime type:', maskMimeType);
          } else {
            const maskBase64Match = maskImageBase64.match(/base64,(.+)$/);
            if (maskBase64Match) {
              maskData = maskBase64Match[1];
            }
          }
        }

        imageParts.push({
          inlineData: {
            data: maskData,
            mimeType: maskMimeType
          }
        });
        console.log('Mask image added to request');
      } catch (maskError) {
        console.warn('Error processing mask image, continuing without mask:', maskError.message);
      }
    }

    // Construct the replacement prompt
    // System instruction for expert image editing
    const systemInstruction = "You are an expert image editor. Replace the object described in the user prompt with the new design. Keep the rest of the image exactly the same. Maintain lighting, perspective, and overall composition. The replacement should look natural and seamlessly integrated into the original image.";
    
    // User prompt for the replacement
    const userPrompt = prompt.trim();
    
    // Combine system instruction with user prompt
    const fullPrompt = `${systemInstruction}\n\nUser request: ${userPrompt}\n\nPlease replace the specified object/area with the new design while keeping everything else in the image unchanged.`;
    
    console.log('Sending replace request to Gemini API...');
    console.log('Full prompt length:', fullPrompt.length);
    console.log('Has original image:', imageParts.length > 0);
    console.log('Has mask:', maskImageBase64 ? true : false);

    // Prepare content array: prompt first, then images
    const contentParts = [fullPrompt, ...imageParts];

    // Call Gemini API for image replacement
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
      preview: generatedText.substring(0, 200)
    });

    if (!generatedImageBase64) {
      console.warn('No image generated. Response may contain only text.');
      return {
        success: false,
        message: 'Image replacement failed. No image was generated. Please try again.',
        generatedDescription: generatedText || 'Image replacement in progress. Please try again.',
        hasImage: false
      };
    }

    console.log('=== Replace Request Completed Successfully ===');
    
    // Return the generated image as base64 data URI
    const imageDataUri = `data:${generatedImageMimeType || 'image/png'};base64,${generatedImageBase64}`;
    
    return {
      success: true,
      message: 'Image replacement completed successfully using Gemini 2.5 Flash Image Preview.',
      imageDataUri: imageDataUri,
      generatedImageBase64: generatedImageBase64,
      imageMimeType: generatedImageMimeType,
      generatedDescription: generatedText || 'Image replacement completed successfully.',
      hasImage: true
    };

  } catch (error) {
    console.error('=== Error in replace function ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Error in replace function', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Image replacement failed: ${error.message}`);
  }
});

