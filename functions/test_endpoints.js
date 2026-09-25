/**
 * test_endpoints.js
 * 
 * Tests all 7 dedicated Cloud Function endpoints deployed to Firebase.
 * Run with: node test_endpoints.js
 *
 * Strategy: Test WITHOUT an image first (just prompt) to confirm routing,
 * auth, and Gemini connection work. Image-only endpoints skip the image param.
 */

'use strict';

const https = require('https');
const { execSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────
const PROJECT_ID = 'ai-visuals-app';
const REGION = 'us-central1';

// Read a real local JPEG and encode it properly for the test
// Using a real image from the project assets
function getRealImageBase64() {
  try {
    const fs = require('fs');
    const path = require('path');
    // Try to find any JPEG/webp asset in the project
    const assetDirs = [
      path.join(__dirname, '..', 'src', 'assets'),
    ];
    for (const dir of assetDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const imgFile = files.find(f => f.match(/\.(jpg|jpeg|webp|png)$/i));
        if (imgFile) {
          const data = fs.readFileSync(path.join(dir, imgFile));
          console.log(`  Using test image: ${imgFile} (${data.length} bytes)`);
          return data.toString('base64');
        }
      }
    }
  } catch (e) { /* fallback */ }
  return null;
}

// ── Callable HTTP helper ───────────────────────────────────────────────────────
function callCallable(functionName, data, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const bodyObj = { data };
    const body = JSON.stringify(bodyObj);

    const options = {
      hostname: `${REGION}-${PROJECT_ID}.cloudfunctions.net`,
      path: `/${functionName}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-firebase-client': 'fire-js/0.0.0',
      },
      timeout: timeoutMs,
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ statusCode: res.statusCode, body: raw });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timed out after ${timeoutMs / 1000}s`)); });

    req.write(body);
    req.end();
  });
}

// ── Print helpers ─────────────────────────────────────────────────────────────
function printResult(name, passed, detail) {
  console.log(`\n${passed ? '✅' : '❌'}  ${name}`);
  if (detail) console.log(`   ${detail}`);
}

// ── Test runner ────────────────────────────────────────────────────────────────
async function runAll() {
  console.log('='.repeat(62));
  console.log('  🔥 Firebase Cloud Functions — Endpoint Test Suite');
  console.log(`  Project : ${PROJECT_ID}  |  Region: ${REGION}`);
  console.log('='.repeat(62));

  const imageBase64 = getRealImageBase64();
  if (!imageBase64) {
    console.log('  ⚠️  No local image found — testing text-only (no image input).');
  } else {
    console.log(`  ✅ Real image loaded (${imageBase64.length} chars)`);
  }
  console.log('  ⏳ Each endpoint triggers real Gemini generation (~30-90s)\n');

  // ── Tests ──────────────────────────────────────────────────────────────────
  const tests = [
    {
      name: '1. designInterior',
      fn: 'designInterior',
      // No image — generate from style+room only
      data: { roomType: 'Living Room', style: 'modern' },
      validate: (b) => b?.result?.success === true && !!b?.result?.imageBase64,
    },
    {
      name: '2. designExterior',
      fn: 'designExterior',
      data: { roomType: 'House', style: 'luxury' },
      validate: (b) => b?.result?.success === true && !!b?.result?.imageBase64,
    },
    {
      name: '3. designGarden',
      fn: 'designGarden',
      data: { roomType: 'Backyard', style: 'tropical' },
      validate: (b) => b?.result?.success === true && !!b?.result?.imageBase64,
    },
    {
      name: '4. designNewWalls',
      fn: 'designNewWalls',
      // Walls/flooring/replace require an image — skip image if not available
      data: imageBase64
        ? { imageBase64, prompt: 'White marble walls with gold accents', roomType: 'Living Room' }
        : { imageBase64: 'SKIP', prompt: 'White marble walls with gold accents', roomType: 'Living Room' },
      validate: (b) => b?.result?.success === true && !!b?.result?.imageBase64,
    },
    {
      name: '5. designNewFlooring',
      fn: 'designNewFlooring',
      data: imageBase64
        ? { imageBase64, prompt: 'Dark oak herringbone hardwood flooring', roomType: 'Living Room' }
        : { imageBase64: 'SKIP', prompt: 'Dark oak herringbone hardwood flooring', roomType: 'Living Room' },
      validate: (b) => b?.result?.success === true && !!b?.result?.imageBase64,
    },
    {
      name: '6. designReplace',
      fn: 'designReplace',
      data: imageBase64
        ? { imageBase64, prompt: 'Replace sofa with modern grey sectional' }
        : { imageBase64: 'SKIP', prompt: 'Replace sofa with modern grey sectional' },
      validate: (b) => b?.result?.success === true && !!b?.result?.imageBase64,
    },
    {
      name: '7. design3DMaker',
      fn: 'design3DMaker',
      data: imageBase64
        ? { imageBase64, prompt: 'Convert to photorealistic 3D isometric render' }
        : { imageBase64: 'SKIP', prompt: 'Convert to photorealistic 3D isometric render' },
      validate: (b) => b?.result?.success === true && !!b?.result?.imageBase64,
    },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`⏳ Testing ${test.name}...`);
    const start = Date.now();
    try {
      const { statusCode, body } = await callCallable(test.fn, test.data);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const passed = statusCode === 200 && test.validate(body);

      if (passed) {
        const imgLen = body?.result?.imageBase64?.length || 0;
        printResult(test.name, true, `${elapsed}s | HTTP ${statusCode} | image: ${imgLen} chars | storage: ${body?.result?.storagePath || 'n/a'}`);
      } else {
        const err =
          body?.error?.message ||
          body?.result?.message ||
          JSON.stringify(body).slice(0, 400);
        printResult(test.name, false, `${elapsed}s | HTTP ${statusCode} | ${err}`);
      }
      results.push({ name: test.name, passed });
    } catch (err) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      printResult(test.name, false, `${elapsed}s | ${err.message}`);
      results.push({ name: test.name, passed: false });
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.filter((r) => !r.passed).length;

  console.log('\n' + '='.repeat(62));
  console.log(`  📊 Results: ${passCount}/${results.length} endpoints passed`);
  if (failCount === 0) {
    console.log('  🎉 All 7 endpoints working perfectly!');
  } else {
    console.log(`  ⚠️  ${failCount} endpoint(s) need attention:`);
    results.filter((r) => !r.passed).forEach((r) => console.log(`     ❌ ${r.name}`));
  }
  console.log('='.repeat(62) + '\n');
}

runAll().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
