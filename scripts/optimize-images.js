/**
 * Image Optimization Script for East Coast AC & Heating Website
 *
 * This script uses Sharp to:
 * - Convert the 8 critical homepage service images to modern WebP format
 * - Resize them appropriately for their display size (card grid)
 * - Apply strong compression while maintaining good visual quality
 *
 * Usage (run from project root):
 *   powershell -ExecutionPolicy Bypass -Command "node scripts/optimize-images.js"
 *
 * Requirements:
 *   npm install sharp --save-dev
 *
 * After running, update your <img> tags to use <picture> with WebP + JPG fallback.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// The 8 critical images from the homepage "Complete HVAC Services" grid
const IMAGES_TO_OPTIMIZE = [
  'fire-alarm-installation-surrey.jpg',
  'panel-upgrade.jpg',
  'house-rewiring-surrey.jpg',
  'commercial-hvac-project-surrey.jpg',
  'ev-charger-installation-surrey.jpg',
  'led-lighting-installation-surrey.jpg',
  'smoke-detector-installation-surrey.jpg',
  'service-van-surrey.jpg',
];

// Target max width for these card images (they display at ~300-400px wide)
const MAX_WIDTH = 800;
const WEBP_QUALITY = 78; // Excellent balance of size vs quality for WebP

async function optimizeImages() {
  console.log('🚀 Starting image optimization for homepage performance...\n');

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const filename of IMAGES_TO_OPTIMIZE) {
    const inputPath = path.join(IMAGES_DIR, filename);
    const webpFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const outputPath = path.join(IMAGES_DIR, webpFilename);

    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️  Skipping ${filename} — file not found`);
      continue;
    }

    try {
      const originalStats = fs.statSync(inputPath);
      const originalSizeMB = (originalStats.size / 1024 / 1024).toFixed(2);

      // Get metadata to preserve aspect ratio
      const metadata = await sharp(inputPath).metadata();

      // Resize + convert to WebP
      await sharp(inputPath)
        .resize({
          width: MAX_WIDTH,
          withoutEnlargement: true, // Don't upscale small images
          fit: 'inside',
        })
        .webp({
          quality: WEBP_QUALITY,
          effort: 6, // Higher effort = better compression (slower but worth it)
        })
        .toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSizeKB = (newStats.size / 1024).toFixed(0);
      const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);

      console.log(`✅ ${filename}`);
      console.log(`   ${originalSizeMB} MB → ${newSizeKB} KB  (−${savings}%)`);
      console.log(`   → ${webpFilename}\n`);

      totalOriginal += originalStats.size;
      totalOptimized += newStats.size;
    } catch (err) {
      console.error(`❌ Failed to optimize ${filename}:`, err.message);
    }
  }

  const totalOriginalMB = (totalOriginal / 1024 / 1024).toFixed(2);
  const totalOptimizedMB = (totalOptimized / 1024 / 1024).toFixed(2);
  const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);

  console.log('────────────────────────────────────────────');
  console.log(`📊 TOTAL for these 8 images:`);
  console.log(`   Before: ${totalOriginalMB} MB`);
  console.log(`   After:  ${totalOptimizedMB} MB`);
  console.log(`   Savings: ${totalSavings}% reduction\n`);

  console.log('🎉 Optimization complete!');
  console.log('\nNext steps:');
  console.log('1. Update index.html to use <picture> elements (see the prepared markup)');
  console.log('2. Test the site (the WebP versions will be used automatically in modern browsers)');
  console.log('3. You can safely delete the old large JPGs later if you want (keep them for now as fallbacks).');
}

optimizeImages().catch(console.error);