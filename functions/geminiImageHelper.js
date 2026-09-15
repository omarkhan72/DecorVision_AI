const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generate a photorealistic image using Google Imagen 3 API
 * @param {string} prompt - Detailed image generation prompt
 * @param {string} apiKey - Gemini / Google AI Studio API key
 * @param {string} aspectRatio - e.g. "1:1", "4:3", "16:9"
 * @returns {Promise<{ base64: string, mimeType: string }>}
 */
async function generateWithImagen3(prompt, apiKey, aspectRatio = "1:1") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [{ prompt: prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Imagen 3 API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (data.predictions && data.predictions.length > 0 && data.predictions[0].bytesBase64Encoded) {
    return {
      base64: data.predictions[0].bytesBase64Encoded,
      mimeType: data.predictions[0].mimeType || "image/jpeg",
    };
  }

  throw new Error("No image returned from Imagen 3 model");
}

/**
 * Analyzes an input image with Gemini multimodal and generates an enhanced prompt for Imagen
 * @param {string} apiKey
 * @param {string} base64Image
 * @param {string} instructions
 * @returns {Promise<string>}
 */
async function enhancePromptWithImage(apiKey, base64Image, instructions) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const visionModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let cleanBase64 = base64Image;
    let mimeType = "image/jpeg";

    if (base64Image.startsWith("data:")) {
      const match = base64Image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = match[2];
      }
    }

    const prompt = `${instructions}
Describe the transformed room in a single comprehensive, photorealistic image generation prompt. Focus on architectural details, furniture, colors, textures, materials, and lighting. Output ONLY the descriptive prompt without any intro or outro.`;

    const result = await visionModel.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();
    return responseText ? responseText.trim() : instructions;
  } catch (err) {
    console.warn("Vision analysis fallback, using instructions directly:", err?.message || err);
    return instructions;
  }
}

module.exports = {
  generateWithImagen3,
  enhancePromptWithImage,
};
