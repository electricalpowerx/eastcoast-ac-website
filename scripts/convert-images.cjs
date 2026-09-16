/**
 * Convert all HEIC files in public/images to high-quality JPG.
 * Run with: node scripts/convert-images.js
 */

const fs = require('fs');
const path = require('path');
const convert = require('heic-convert');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

async function convertHeics() {
  const files = fs.readdirSync(imagesDir);
  const heicFiles = files.filter(f => /\.(heic|HEIC)$/i.test(f));

  console.log(`Found ${heicFiles.length} HEIC files to convert...`);

  for (const file of heicFiles) {
    const heicPath = path.join(imagesDir, file);
    const jpgName = file.replace(/\.(heic|HEIC)$/i, '.jpg');
    const jpgPath = path.join(imagesDir, jpgName);

    // Skip if JPG already exists
    if (fs.existsSync(jpgPath)) {
      console.log(`Skipping ${file} (JPG already exists)`);
      continue;
    }

    try {
      const inputBuffer = fs.readFileSync(heicPath);
      const outputBuffer = await convert({
        buffer: inputBuffer,
        format: 'JPEG',
        quality: 0.92
      });

      fs.writeFileSync(jpgPath, outputBuffer);
      console.log(`Converted: ${file} → ${jpgName}`);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message);
    }
  }

  console.log('\nConversion complete!');
  console.log('You can now delete the original .HEIC files if you want (they are no longer needed).');
}

convertHeics().catch(console.error);