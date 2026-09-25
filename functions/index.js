/**
 * Firebase Cloud Functions — AI Design App
 *
 * Feature-specific dedicated endpoints (best practice architecture):
 *   designInterior    → Interior Design
 *   designExterior    → Exterior Design
 *   designGarden      → Garden Design
 *   designNewWalls    → New Walls
 *   designNewFlooring → New Flooring
 *   designReplace     → Object Replace
 *   design3DMaker     → 3D Design Maker (Blueprint → 3D)
 *   deleteUserAccount → Account deletion
 */

'use strict';

const { setGlobalOptions } = require('firebase-functions');

// Global defaults: max 10 concurrent instances per function
setGlobalOptions({ maxInstances: 10 });

// ── Interior Design ──────────────────────────────────────────────────────────
exports.designInterior = require('./designInterior').designInterior;

// ── Exterior Design ──────────────────────────────────────────────────────────
exports.designExterior = require('./designExterior').designExterior;

// ── Garden Design ────────────────────────────────────────────────────────────
exports.designGarden = require('./designGarden').designGarden;

// ── New Walls ────────────────────────────────────────────────────────────────
exports.designNewWalls = require('./designNewWalls').designNewWalls;

// ── New Flooring ─────────────────────────────────────────────────────────────
exports.designNewFlooring = require('./designNewFlooring').designNewFlooring;

// ── Object Replace ───────────────────────────────────────────────────────────
exports.designReplace = require('./designReplace').designReplace;

// ── 3D Design Maker (Blueprint → 3D) ────────────────────────────────────────
exports.design3DMaker = require('./design3DMaker').design3DMaker;

// ── Account Management ───────────────────────────────────────────────────────
exports.deleteUserAccount = require('./deleteUserAccount').deleteUserAccount;
