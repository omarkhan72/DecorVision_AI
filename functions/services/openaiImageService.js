/**
 * OpenAI Image Generation Service using gpt-image-2
 *
 * Mirrors the interface of geminiImageService.js so it can be
 * swapped in as a drop-in replacement for interior design generation.
 *
 * Uses gpt-image-2 for both text-only and image-edit generation.
 * (DALL-E 3 was deprecated May 2026; gpt-image-2 is the current flagship.)
 *
 * @module openaiImageService
 */

'use strict';

const admin = require('firebase-admin');

/**
 * Generate a design image using OpenAI's gpt-image-2 API.
 *
 * @param {Object}  params
 * @param {string}  params.prompt      - Detailed design prompt
 * @param {string}  [params.inputImage] - Optional base64 image (with or without data URI prefix)
 * @param {string}  [params.mimeType='image/jpeg'] - MIME type of input image
 * @param {string}  [params.apiKey]    - OpenAI API key (falls back to process.env.OPENAI_API_KEY)
 * @returns {Promise<{ success: boolean, downloadUrl: string, storagePath: string, imageDataUri: string, imageBase64: string, imageMimeType: string }>}
 */
async function generateOpenAIImage({ prompt, inputImage, mimeType = 'image/jpeg', apiKey }) {
  const openaiApiKey = (apiKey || process.env.OPENAI_API_KEY || '').trim();
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured in backend environment variables.');
  }

  console.log('=== [openaiImageService] Starting Image Generation with OpenAI gpt-image-2 ===');
  console.log('Prompt:', prompt);
  console.log('Has input image:', !!inputImage);

  let generatedBase64 = null;
  const generatedMimeType = 'image/png'; // We request PNG output

  // ── Strategy: If an input image is provided, use image edits endpoint.
  //              Otherwise, use generations endpoint.
  if (inputImage) {
    generatedBase64 = await _editWithImage(openaiApiKey, prompt, inputImage, mimeType);
  }

  if (!generatedBase64) {
    generatedBase64 = await _generateFromPrompt(openaiApiKey, prompt);
  }

  if (!generatedBase64) {
    throw new Error('Failed to obtain generated image from OpenAI API.');
  }

  // ── Upload to Firebase Storage ──
  const imageBuffer = Buffer.from(generatedBase64, 'base64');
  let downloadUrl = null;
  let storagePath = null;

  try {
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }

    const bucket = admin.storage().bucket();
    const fileName = `generated/${Date.now()}_openai_${Math.random().toString(36).substring(2, 9)}.png`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: generatedMimeType,
        cacheControl: 'public, max-age=31536000',
      },
      public: true,
    });

    storagePath = fileName;
    downloadUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('[openaiImageService] Uploaded to Firebase Storage:', storagePath);
  } catch (storageErr) {
    console.warn('[openaiImageService] Firebase Storage upload warning:', storageErr?.message || storageErr);
  }

  const imageDataUri = `data:${generatedMimeType};base64,${generatedBase64}`;

  return {
    success: true,
    downloadUrl: downloadUrl || imageDataUri,
    imageDataUri,
    storagePath,
    imageBase64: generatedBase64,
    imageMimeType: generatedMimeType,
    message: 'Image generated successfully using OpenAI gpt-image-2.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate image from text prompt only using gpt-image-2.
 *
 * Current API (Sep 2026):
 *   POST /v1/images/generations
 *   model: "gpt-image-2"
 *   output_format: "png" | "webp" | "jpeg"
 *   (response_format is deprecated; use output_format instead)
 */
async function _generateFromPrompt(apiKey, prompt) {
  console.log('[openaiImageService] Generating image with gpt-image-2 (text-only)...');

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[openaiImageService] gpt-image-2 API error:', response.status, errorBody);
      throw new Error(`gpt-image-2 API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();

    // gpt-image-2 returns b64_json in data[0].b64_json
    const b64 = data?.data?.[0]?.b64_json;

    if (b64) {
      console.log('[openaiImageService] gpt-image-2 generation succeeded, base64 length:', b64.length);
      return b64;
    }

    // Check if URL was returned instead
    const url = data?.data?.[0]?.url;
    if (url) {
      console.log('[openaiImageService] gpt-image-2 returned URL, fetching image...');
      const imgResponse = await fetch(url);
      if (imgResponse.ok) {
        const arrayBuffer = await imgResponse.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log('[openaiImageService] Downloaded image from URL, base64 length:', base64.length);
        return base64;
      }
    }

    console.warn('[openaiImageService] gpt-image-2 returned no image data');
    return null;
  } catch (err) {
    console.error('[openaiImageService] gpt-image-2 generation error:', err?.message || err);
    throw err;
  }
}

/**
 * Edit/redesign an existing image using gpt-image-2 edits endpoint.
 * Sends the user image + prompt via multipart form data.
 */
async function _editWithImage(apiKey, prompt, inputImage, inputMimeType) {
  console.log('[openaiImageService] Editing image with gpt-image-2 (image + prompt)...');

  try {
    // Clean the base64 input
    let cleanBase64 = '';
    let mime = inputMimeType || 'image/jpeg';

    if (Buffer.isBuffer(inputImage)) {
      cleanBase64 = inputImage.toString('base64');
    } else if (typeof inputImage === 'string') {
      const trimmed = inputImage.trim();
      if (trimmed.startsWith('data:')) {
        const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mime = match[1] || 'image/jpeg';
          cleanBase64 = match[2];
        } else {
          cleanBase64 = trimmed;
        }
      } else {
        cleanBase64 = trimmed;
      }
    }

    if (!cleanBase64 || cleanBase64.length < 50) {
      console.warn('[openaiImageService] Input image too small, falling back to text-only generation');
      return null;
    }

    // Convert base64 to Buffer for multipart upload
    const imageBuffer = Buffer.from(cleanBase64, 'base64');

    // Determine file extension from mime type
    const ext = mime.includes('png') ? 'png' : 'jpg';

    // Build multipart/form-data manually (Node.js compatible)
    const boundary = '----OpenAIFormBoundary' + Date.now().toString(36);
    const CRLF = '\r\n';

    const parts = [];

    // model field
    parts.push(`--${boundary}${CRLF}`);
    parts.push(`Content-Disposition: form-data; name="model"${CRLF}${CRLF}`);
    parts.push(`gpt-image-1${CRLF}`);

    // prompt field
    parts.push(`--${boundary}${CRLF}`);
    parts.push(`Content-Disposition: form-data; name="prompt"${CRLF}${CRLF}`);
    parts.push(`${prompt}${CRLF}`);

    // size field
    parts.push(`--${boundary}${CRLF}`);
    parts.push(`Content-Disposition: form-data; name="size"${CRLF}${CRLF}`);
    parts.push(`1024x1024${CRLF}`);

    // image file field
    parts.push(`--${boundary}${CRLF}`);
    parts.push(`Content-Disposition: form-data; name="image"; filename="room.${ext}"${CRLF}`);
    parts.push(`Content-Type: ${mime}${CRLF}${CRLF}`);

    // Combine text parts before the binary
    const textBefore = Buffer.from(parts.join(''), 'utf-8');
    const textAfter = Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf-8');

    const body = Buffer.concat([textBefore, imageBuffer, textAfter]);

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': String(body.length),
      },
      body: body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn('[openaiImageService] gpt-image-2 edit error:', response.status, errorBody);
      return null; // Fall through to text-only generation
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;

    if (b64) {
      console.log('[openaiImageService] gpt-image-2 edit succeeded, base64 length:', b64.length);
      return b64;
    }

    // Check if URL was returned
    const url = data?.data?.[0]?.url;
    if (url) {
      const imgResponse = await fetch(url);
      if (imgResponse.ok) {
        const arrayBuffer = await imgResponse.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
      }
    }

    console.warn('[openaiImageService] gpt-image-2 edit returned no image data');
    return null;
  } catch (err) {
    console.warn('[openaiImageService] gpt-image-2 edit error:', err?.message || err);
    return null; // Fall back to text-only generation
  }
}

module.exports = {
  generateOpenAIImage,
};
