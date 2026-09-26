// /**
//  * designInterior - Dedicated Cloud Function for Interior Design feature
//  * Accepts: designType, roomType, style, imageBase64 (optional)
//  * Returns: generated interior design image
//  *
//  * Primary:  OpenAI  (DALL-E 3 / gpt-image-1)
//  * Fallback: Gemini  (gemini-3.6-flash / gemini-2.5-flash-image)
//  */

// 'use strict';

// const { onCall } = require('firebase-functions/v2/https');
// const logger = require('firebase-functions/logger');

// /**
//  * Build a detailed interior design prompt based on room type and style.
//  */
// function buildInteriorPrompt(roomType, style, hasImage = false) {
//   if (hasImage) {
//     let prompt = `Redesign and transform this real ${roomType} interior into a stunning, photorealistic ${style} style room design. `;
//     prompt += `Maintain the original room perspective, camera angle, and architectural wall/window structure, but completely redesign the interior: replace the existing furniture, decor, lighting, wall finishes, and color palette with premium ${style} interior elements: `;
//     switch (style) {
//       case 'modern':
//         prompt += 'sleek contemporary furniture, clean lines, neutral colors with bold accents, modern lighting fixtures, and high-end finishes.';
//         break;
//       case 'cozy':
//         prompt += 'warm textures, plush comfortable seating, layered fabrics, soft ambient lighting, warm earth tones, and an inviting homey atmosphere.';
//         break;
//       case 'luxury':
//         prompt += 'opulent high-end designer furniture, marble and brass accents, rich sophisticated color palette, statement chandelier lighting, and bespoke architectural details.';
//         break;
//       case 'minimalist':
//         prompt += 'simple uncluttered spaces, functional designer furniture, neutral tones, concealed storage, and abundant clean natural light.';
//         break;
//       case 'scandinavian':
//         prompt += 'light wood finishes, warm textiles, clean white walls, functional minimalist furniture, and a tranquil hygge ambiance.';
//         break;
//       case 'airbnb':
//         prompt += 'stylish welcoming space, photogenic Instagram-worthy decor, comfortable seating, good ambient lighting, and practical layout.';
//         break;
//       case 'midcentury':
//         prompt += 'iconic mid-century modern furniture, walnut and teak wood, retro geometric patterns, warm hues, and vintage designer accents.';
//         break;
//       case 'rustic':
//         prompt += 'exposed timber beams, natural stone textures, reclaimed wood furniture, warm earthy colors, and cozy country charm.';
//         break;
//       case 'zen':
//         prompt += 'peaceful organic minimalism, low-profile furniture, natural bamboo and light wood, soft diffused lighting, and tranquil balance.';
//         break;
//       case 'tropical':
//         prompt += 'lush indoor palms, natural rattan and bamboo furnishings, vibrant botanical accents, and airy resort-inspired feel.';
//         break;
//       case 'coastal':
//         prompt += 'light ocean blues and crisp whites, natural jute and linen textures, weathered wood accents, and bright breezy coastal aesthetic.';
//         break;
//       case 'vintage':
//         prompt += 'curated antique furniture, classic wainscoting or moldings, warm nostalgic colors, ornamental frames, and timeless elegance.';
//         break;
//       default:
//         prompt += 'beautiful designer furniture and decor perfectly suited to the selected style.';
//     }
//     prompt += ' The final image must look like a high-end architectural digest photograph, 8k resolution, perfectly rendered with realistic lighting.';
//     return prompt;
//   }

//   let prompt = `Transform this ${roomType} into a stunning, photorealistic ${style} style interior design. `;

//   switch (style) {
//     case 'modern':
//       prompt += 'Features: clean lines, minimalist furniture, neutral colors with bold accents, contemporary lighting, and sleek finishes.';
//       break;
//     case 'cozy':
//       prompt += 'Features: warm textures, soft fabrics, comfortable seating, warm lighting, earth tones, and inviting atmosphere.';
//       break;
//     case 'luxury':
//       prompt += 'Features: high-end materials, elegant furniture, rich colors, sophisticated lighting, premium finishes, opulent details.';
//       break;
//     case 'minimalist':
//       prompt += 'Features: simple clean spaces, neutral palette, functional furniture, uncluttered surfaces, and natural light.';
//       break;
//     case 'scandinavian':
//       prompt += 'Features: light wood, white walls, cozy textiles, natural elements, simple furniture, and hygge atmosphere.';
//       break;
//     case 'airbnb':
//       prompt += 'Features: welcoming and functional space, comfortable furniture, good lighting, neutral colors, and homey touches.';
//       break;
//     case 'midcentury':
//       prompt += 'Features: retro furniture, bold geometric patterns, warm wood tones, vintage accessories, and iconic mid-century pieces.';
//       break;
//     case 'rustic':
//       prompt += 'Features: natural materials, exposed wood, stone elements, warm colors, vintage pieces, and country charm.';
//       break;
//     case 'zen':
//       prompt += 'Features: peaceful atmosphere, natural materials, minimal decor, soft lighting, neutral colors, and tranquil space.';
//       break;
//     case 'tropical':
//       prompt += 'Features: lush plants, bright colors, natural materials, island vibes, relaxed atmosphere, and exotic touches.';
//       break;
//     case 'coastal':
//       prompt += 'Features: light blues and whites, nautical elements, natural textures, beach-inspired decor, and airy feel.';
//       break;
//     case 'vintage':
//       prompt += 'Features: antique furniture, classic patterns, warm colors, nostalgic elements, and timeless charm.';
//       break;
//     default:
//       prompt += 'Features: beautiful and functional design that matches the selected style.';
//   }

//   prompt += ` The ${roomType} should feel complete, well-designed, and professionally styled. High-end architectural photography, 8k resolution, cinematic lighting, perfectly rendered.`;
//   return prompt;
// }

// /**
//  * designInterior Cloud Function
//  * Endpoint: designInterior
//  *
//  * Uses OpenAI (DALL-E 3 / gpt-image-1) as the primary engine.
//  * Falls back to Gemini if OpenAI is unavailable or fails.
//  */
// exports.designInterior = onCall(
//   {
//     maxInstances: 10,
//     timeoutSeconds: 300,
//     memory: '512MiB',
//     enforceAppCheck: false,
//   },
//   async (request) => {
//     try {
//       console.log('=== [designInterior] Request Started ===');
//       const { roomType, style, imageBase64 } = request.data;

//       // Validate required parameters
//       if (!roomType || !style) {
//         throw new Error('Missing required parameters: roomType and style are required');
//       }

//       logger.info('[designInterior] Request', { roomType, style, hasImage: !!imageBase64 });

//       const prompt = buildInteriorPrompt(roomType, style, !!imageBase64);
//       console.log('[designInterior] Prompt:', prompt);

//       // ── Try OpenAI first ──────────────────────────────────────────────────
//       const openaiApiKey = process.env.OPENAI_API_KEY;
//       if (openaiApiKey) {
//         try {
//           console.log('[designInterior] Attempting generation with OpenAI...');
//           const { generateOpenAIImage } = require('./services/openaiImageService');

//           const result = await generateOpenAIImage({
//             prompt,
//             inputImage: imageBase64,
//             apiKey: openaiApiKey,
//           });

//           logger.info('[designInterior] OpenAI Success', { storagePath: result.storagePath });

//           return {
//             success: true,
//             prompt,
//             imageDataUri: result.imageDataUri,
//             downloadUrl: result.downloadUrl,
//             storagePath: result.storagePath,
//             imageBase64: result.imageBase64,
//             imageMimeType: result.imageMimeType || 'image/png',
//             designType: 'interior',
//             roomType,
//             style,
//             hasImage: true,
//             provider: 'openai',
//             message: 'Interior design image generated successfully via OpenAI.',
//           };
//         } catch (openaiErr) {
//           console.warn('[designInterior] OpenAI failed, falling back to Gemini:', openaiErr.message);
//           logger.warn('[designInterior] OpenAI fallback', { error: openaiErr.message });
//         }
//       } else {
//         console.log('[designInterior] No OPENAI_API_KEY set, using Gemini directly.');
//       }

//       // ── Fallback to Gemini ────────────────────────────────────────────────
//       console.log('[designInterior] Using Gemini as fallback...');
//       const geminiApiKey = process.env.GEMINI_API_KEY;
//       if (!geminiApiKey) {
//         throw new Error('Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured.');
//       }

//       const { generateGeminiImage } = require('./services/geminiImageService');

//       const result = await generateGeminiImage({
//         prompt,
//         inputImage: imageBase64,
//         apiKey: geminiApiKey,
//       });

//       logger.info('[designInterior] Gemini Fallback Success', { storagePath: result.storagePath });

//       return {
//         success: true,
//         prompt,
//         imageDataUri: result.imageDataUri,
//         downloadUrl: result.downloadUrl,
//         storagePath: result.storagePath,
//         imageBase64: result.imageBase64,
//         imageMimeType: result.imageMimeType || 'image/jpeg',
//         designType: 'interior',
//         roomType,
//         style,
//         hasImage: true,
//         provider: 'gemini',
//         message: 'Interior design image generated successfully via Gemini (fallback).',
//       };
//     } catch (error) {
//       console.error('[designInterior] Error:', error.message);
//       logger.error('[designInterior] Error', { message: error.message });
//       throw new Error(`Interior design generation failed: ${error.message}`);
//     }
//   }
// );




/**
 * Build a realistic, photography-style interior design prompt.
 * Goal: output that looks like a real photo taken by an interior photographer,
 * not a glossy AI/CGI render.
 */
function buildInteriorPrompt(roomType, style, hasImage = false) {
  const styleDetails = {
    modern:
      'contemporary furniture with clean lines, a warm neutral palette (greige, off-white, charcoal) with one or two muted accent colors, matte black or brushed metal fixtures, oak or walnut wood, a low-pile wool rug, and simple pendant or recessed lighting',
    cozy:
      'a deep comfortable sofa with linen or boucle upholstery, chunky knit throws and layered cushions, a wool rug, warm wood furniture, table and floor lamps giving soft 2700K light, earthy tones like terracotta, sand and olive, and a few books and candles',
    luxury:
      'high-quality designer furniture, real marble or travertine surfaces with natural veining, brushed brass details, velvet and fine wool upholstery, a refined deep color palette, a statement light fixture sized correctly for the room, and tailored custom joinery',
    minimalist:
      'very few carefully chosen pieces, functional furniture with simple forms, a calm neutral palette of white, stone and light oak, flush storage with no visible clutter, and plenty of natural daylight',
    scandinavian:
      'light oak or ash wood, soft white walls, simple functional furniture, wool and linen textiles, a sheepskin or natural fiber rug, a few green plants, and bright soft daylight',
    airbnb:
      'a welcoming, practical guest-ready setup with comfortable seating, neatly made textiles, a mix of warm lamps and daylight, a neutral base palette with tasteful accents, simple wall art, and useful touches like a small plant and a tidy side table',
    midcentury:
      'authentic mid-century modern furniture with tapered wooden legs, walnut and teak finishes, a low sideboard, warm mustard, olive and rust accents, a geometric rug, and a classic arc or globe lamp',
    rustic:
      'reclaimed wood furniture with visible grain and knots, natural stone or brick textures, wood ceiling beams where they fit the structure, wrought iron details, warm earthy colors, and woven baskets and linen textiles',
    zen:
      'low-profile furniture, natural light wood and bamboo, a calm palette of sand, stone and soft green, rice paper or linen lighting, a simple indoor plant, and an uncluttered balanced layout',
    tropical:
      'real indoor plants like monstera, bird of paradise and palms, natural rattan and cane furniture, light linen fabrics, botanical accents used with restraint, and bright airy daylight',
    coastal:
      'soft whites and muted ocean blues, slipcovered linen seating, jute and sisal rugs, light weathered wood, subtle striped textiles, and bright breezy daylight without obvious nautical cliches',
    vintage:
      'a curated mix of real antique and vintage furniture with natural patina, wall moldings or wainscoting, warm muted colors, framed artwork, a Persian-style rug, and brass or fabric-shade lamps',
  };

  const details =
    styleDetails[style] ||
    'well-chosen furniture, materials and decor that clearly match the selected style';

  // Photography language that makes the result look like a real photo
  const photoRealism =
    'Shot as a real interior photograph with a full-frame DSLR camera and a 24mm lens at eye level (about 1.5m high), ' +
    'with vertical lines kept straight. Natural daylight from the windows mixed with warm practical lamps, soft realistic shadows, ' +
    'accurate white balance, natural colors with no over-saturation, gentle depth of field, and fine natural image grain.';

  const materialRealism =
    'Materials must look physically real: visible wood grain, natural fabric weave and slight creases in cushions and bedding, ' +
    'real stone veining, subtle reflections on glass and metal, and soft light falloff in the corners. ' +
    'Furniture must be true to real-world scale and proportion, sit firmly on the floor, and follow a practical, livable layout.';

  const livedIn =
    `The ${roomType} should feel real and lived-in but tidy, with a few natural personal touches such as a folded throw, ` +
    'a couple of books, a plant, or a coffee cup, placed naturally rather than perfectly symmetrical.';

  const avoid =
    'Avoid: CGI or 3D render look, plastic or overly glossy surfaces, perfect symmetry, unrealistic glow, HDR effect, ' +
    'fantasy or surreal elements, distorted or melted furniture, floating objects, warped lines, extra or broken windows, ' +
    'duplicated items, people, text, logos and watermarks.';

  if (hasImage) {
    return [
      `Redesign the interior of this real ${roomType} photo in a ${style} style so it looks like a real professional photo taken after a renovation.`,
      'Keep exactly the same camera position, angle, lens perspective, room size, ceiling height, walls, windows, doors, and the direction of the natural light from the original photo. Do not change the architecture.',
      `Replace the furniture, decor, lighting fixtures, wall finishes, flooring finish and color palette with ${details}.`,
      photoRealism,
      materialRealism,
      livedIn,
      avoid,
    ].join(' ');
  }

  return [
    `A realistic photograph of a professionally designed ${roomType} interior in a ${style} style, taken by an interior photographer for a real estate or home magazine listing.`,
    `The room features ${details}.`,
    `The room has a believable real-world architecture with properly placed windows, doors, skirting boards, power outlets and light switches.`,
    photoRealism,
    materialRealism,
    livedIn,
    avoid,
  ].join(' ');
}
