/**
 * test_openai_interior.js
 *
 * Standalone test that validates the OpenAI API key works correctly
 * for interior design image generation using gpt-image-1.
 *
 * Run with:  node test_openai_interior.js
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Simple .env parser
function loadEnv(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.substring(0, eqIndex).trim();
          const value = trimmed.substring(eqIndex + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  } catch (e) {
    console.warn('Could not load .env file:', envPath);
  }
}

// Load environment variables
loadEnv(path.join(__dirname, '.env'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// ── Test case — just 1 test for interior design validation ─────────────────
const TEST = {
  name: 'gpt-image-1 — Modern Living Room Interior',
  prompt: 'A stunning photorealistic modern living room interior design. Features: clean lines, minimalist furniture, neutral colors with bold accents, contemporary lighting, sleek finishes. The living room should feel complete, well-designed, and professionally styled. High-end architectural photography, cinematic lighting.',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function printResult(name, passed, detail) {
  console.log(`\n${passed ? '✅' : '❌'}  ${name}`);
  if (detail) console.log(`   ${detail}`);
}

async function testOpenAIGeneration() {
  const start = Date.now();

  try {
    console.log('⏳ Sending request to OpenAI gpt-image-1...');

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: TEST.prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high',
      }),
    });

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = '';
      try {
        const errJson = JSON.parse(errorBody);
        errorMsg = errJson?.error?.message || errorBody;
      } catch {
        errorMsg = errorBody.slice(0, 500);
      }
      return { passed: false, detail: `${elapsed}s | HTTP ${response.status} | ${errorMsg}` };
    }

    const data = await response.json();

    // Check for b64_json first
    let b64 = data?.data?.[0]?.b64_json;
    let source = 'b64_json';

    // If no b64, check for URL and download it
    if (!b64) {
      const url = data?.data?.[0]?.url;
      if (url) {
        console.log('   Downloading image from URL...');
        const imgResponse = await fetch(url);
        if (imgResponse.ok) {
          const arrayBuffer = await imgResponse.arrayBuffer();
          b64 = Buffer.from(arrayBuffer).toString('base64');
          source = 'url';
        }
      }
    }

    if (b64 && b64.length > 100) {
      // Save the generated image to disk for visual inspection
      const outputDir = path.join(__dirname, 'test_output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = `interior_openai_test_${Date.now()}.png`;
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));

      return {
        passed: true,
        detail: `${elapsed}s | Source: ${source} | Image: ${b64.length} chars | Saved: test_output/${fileName}`,
      };
    }

    return {
      passed: false,
      detail: `${elapsed}s | No image data in response | Keys: ${JSON.stringify(Object.keys(data?.data?.[0] || {}))}`,
    };
  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    return { passed: false, detail: `${elapsed}s | ${err.message}` };
  }
}

// ── Main runner ────────────────────────────────────────────────────────────────
async function runTest() {
  console.log('='.repeat(62));
  console.log('  🎨 OpenAI Interior Design — API Test (gpt-image-1)');
  console.log('='.repeat(62));

  // Pre-flight checks
  if (!OPENAI_API_KEY) {
    console.error('\n  ❌ OPENAI_API_KEY is not set in .env file!');
    console.log('  Add OPENAI_API_KEY=sk-... to functions/.env and try again.\n');
    process.exit(1);
  }
  console.log(`  API Key: ...${OPENAI_API_KEY.slice(-8)}`);
  console.log('  ⏳ This will trigger a real gpt-image-1 generation (~15-40s)\n');

  const result = await testOpenAIGeneration();
  printResult(TEST.name, result.passed, result.detail);

  console.log('\n' + '='.repeat(62));
  if (result.passed) {
    console.log('  🎉 OpenAI interior design test PASSED!');
    console.log('  📁 Check functions/test_output/ for the generated image.');
    console.log('  ✅ API key is valid and working correctly.');
  } else {
    console.log('  ❌ OpenAI interior design test FAILED');
    console.log('  Check the error message above for details.');
  }
  console.log('='.repeat(62) + '\n');
}

runTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
