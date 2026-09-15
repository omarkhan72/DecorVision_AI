/**
 * Blueprint to 3D function - Converts 2D blueprints / floor plans into photorealistic 3D renders using Gemini AI
 */

const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Blueprint to 3D endpoint
 * Converts 2D floor plans into 3D isometric or perspective renders
 * Uses Gemini 2.5 Flash Image Preview model for image generation
 */
exports.blueprintTo3D = onCall(
  {
    maxInstances: 10,
    timeoutSeconds: 540,
    memory: "512MiB",
  },
  async (request) => {
    try {
      console.log("=== Blueprint to 3D Request Started ===");
      const { imageBase64, prompt } = request.data;

      console.log("Request data received:", {
        hasImage: !!imageBase64,
        hasPrompt: !!prompt,
        imageBase64Length: imageBase64 ? imageBase64.length : 0,
      });

      // Validate required parameters
      if (!imageBase64) {
        console.error("Validation failed: Missing imageBase64");
        throw new Error("Missing required parameter: imageBase64 is required");
      }

      const defaultPrompt =
        "Act as an expert 3D architectural renderer. Convert this 2D architectural floor plan into a photorealistic 3D rendered layout. Strictly maintain the structural integrity, walls, and room placements provided in the blueprint, and render it as a high-quality, fully furnished 3D isometric or top-down perspective.";
      const basePrompt = prompt && prompt.trim().length > 0 ? prompt.trim() : defaultPrompt;

      logger.info("Blueprint to 3D request", {
        hasImage: !!imageBase64,
        prompt: basePrompt,
      });

      // Get Gemini API key from environment
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        console.error("GEMINI_API_KEY not found in environment variables");
        throw new Error(
          "GEMINI_API_KEY is not configured. Please set it in Firebase Functions environment variables."
        );
      }

      const { generateWithImagen3, enhancePromptWithImage } = require('./geminiImageHelper');

      console.log("Analyzing blueprint with Gemini 2.0 Flash...");
      const finalPrompt = await enhancePromptWithImage(
        geminiApiKey,
        imageBase64,
        basePrompt
      );

      console.log("Generating 3D architectural render with Imagen 3...");
      const { base64, mimeType } = await generateWithImagen3(finalPrompt, geminiApiKey);

      const imageDataUri = `data:${mimeType || "image/jpeg"};base64,${base64}`;

      return {
        success: true,
        prompt: finalPrompt,
        generatedDescription: finalPrompt,
        imageDataUri: imageDataUri,
        imageBase64: base64,
        imageMimeType: mimeType || "image/jpeg",
        message: "3D floor plan render generated successfully using Imagen 3.",
        hasImage: true,
      };
    } catch (error) {
      console.error("=== Error in blueprintTo3D function ===", error);
      logger.error("Error in blueprintTo3D function", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Blueprint to 3D generation failed: ${error.message}`);
    }
  }
);
