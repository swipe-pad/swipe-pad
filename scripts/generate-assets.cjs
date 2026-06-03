const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const MASTER_ICON_PATH = path.join(__dirname, '../src/app/icon.png');
const MASTER_OG_PATH = path.join(__dirname, '../src/app/opengraph-image.png');
const TOKEN_PLACEHOLDER_PATH = path.join(__dirname, '../public/placeholders/token-placeholder.png');

async function ensureDir(dirName) {
  const dirPath = path.join(PUBLIC_DIR, dirName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function resizeImage(sourcePath, outputPath, size, fit = 'cover', background = null) {
  try {
    let pipeline = sharp(sourcePath);
    if (size) {
      if (typeof size === 'number') {
        pipeline = pipeline.resize(size, size, { fit });
      } else {
        pipeline = pipeline.resize(size.width, size.height, { fit });
      }
    }
    
    if (background) {
      pipeline = pipeline.flatten({ background });
    }

    await pipeline.toFile(outputPath);
    console.log(`✅ Default processed: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to process: ${outputPath}`, error);
  }
}

async function generateFavicons() {
  const targetDir = path.join(PUBLIC_DIR, 'icons');
  await ensureDir('icons');

  const sizes = [16, 32, 48, 180, 192, 256, 384, 512];
  for (const size of sizes) {
    let fileName = `favicon-${size}x${size}.png`;
    // Name handling for standard cases
    if (size === 180) fileName = 'apple-touch-icon.png';
    else if (size === 192) fileName = 'android-chrome-192x192.png';
    else if (size === 512) fileName = 'android-chrome-512x512.png';

    // Maskable icons
    if (size === 512) {
      await resizeImage(MASTER_ICON_PATH, path.join(targetDir, `maskable-icon-512x512.png`), size, 'contain', '#070b14');
    }

    await resizeImage(MASTER_ICON_PATH, path.join(targetDir, fileName), size);
  }
  
  // Create favicon.ico from 32x32
  await resizeImage(MASTER_ICON_PATH, path.join(PUBLIC_DIR, 'favicon.ico'), 32);
}

async function generateSocialBanners() {
  const targetDir = path.join(PUBLIC_DIR, 'social');
  await ensureDir('social');

  // Basic open graph
  await resizeImage(MASTER_OG_PATH, path.join(PUBLIC_DIR, 'og', 'og-image.png'), { width: 1200, height: 630 });
  await resizeImage(MASTER_OG_PATH, path.join(targetDir, 'twitter-card.png'), { width: 1200, height: 600 });
  
  // Platform specific
  const platformSizes = [
    { name: 'x-banner.png', w: 1500, h: 500 },
    { name: 'farcaster-banner.png', w: 1500, h: 500 },
    { name: 'discord-banner.png', w: 1920, h: 480 },
    { name: 'linkedin-banner.png', w: 1584, h: 396 },
    { name: 'github-banner.png', w: 1280, h: 640 }
  ];

  for (const platform of platformSizes) {
    await resizeImage(MASTER_OG_PATH, path.join(targetDir, platform.name), { width: platform.w, height: platform.h });
  }
}

async function generateOtherSpecificAssets() {
  // PWA & MiniPay Specific
  await resizeImage(MASTER_ICON_PATH, path.join(PUBLIC_DIR, 'minipay', 'minipay-icon.png'), 512, 'cover', '#070b14');
  await resizeImage(MASTER_OG_PATH, path.join(PUBLIC_DIR, 'minipay', 'minipay-banner.png'), { width: 1200, height: 630 });
  
  // Farcaster
  await resizeImage(MASTER_OG_PATH, path.join(PUBLIC_DIR, 'farcaster', 'frame-splash.png'), { width: 1200, height: 630 });

  // PWA Splash Screens (iOS)
  await ensureDir('pwa');
  const splashSizes = [
    { name: 'splash-1179x2556.png', w: 1179, h: 2556 },
    { name: 'splash-1290x2796.png', w: 1290, h: 2796 },
    { name: 'splash-1170x2532.png', w: 1170, h: 2532 },
    { name: 'splash-1284x2778.png', w: 1284, h: 2778 }
  ];
  for (const splash of splashSizes) {
    await resizeImage(MASTER_ICON_PATH, path.join(PUBLIC_DIR, 'pwa', splash.name), { width: splash.w, height: splash.h }, 'contain', '#070b14');
  }

  // Tokens & Chains
  await ensureDir('tokens');
  await ensureDir('chains');
  if (fs.existsSync(TOKEN_PLACEHOLDER_PATH)) {
    await resizeImage(TOKEN_PLACEHOLDER_PATH, path.join(PUBLIC_DIR, 'tokens', 'default-token-64x64.png'), 64);
    await resizeImage(TOKEN_PLACEHOLDER_PATH, path.join(PUBLIC_DIR, 'tokens', 'token-128x128.png'), 128);
    await resizeImage(TOKEN_PLACEHOLDER_PATH, path.join(PUBLIC_DIR, 'chains', 'chain-32x32.png'), 32);
    await resizeImage(TOKEN_PLACEHOLDER_PATH, path.join(PUBLIC_DIR, 'tokens', 'nft-placeholder-512x512.png'), 512);
  }
}

async function run() {
  console.log('🚀 Starting asset generation...');
  if (!fs.existsSync(MASTER_ICON_PATH) || !fs.existsSync(MASTER_OG_PATH)) {
    console.error('Master files missing. Please ensure /src/app/icon.png and /src/app/opengraph-image.png exist.');
    process.exit(1);
  }

  await generateFavicons();
  await generateSocialBanners();
  await generateOtherSpecificAssets();
  
  console.log('🎉 Asset generation complete!');
}

run();
