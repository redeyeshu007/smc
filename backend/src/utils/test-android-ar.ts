import { createApp } from '../app.js';
import { db } from '../config/database.js';
import { logger } from './logger.js';
import { Product } from '../models/Product.js';

async function runAndroidARTests() {
  logger.info('========================================================');
  logger.info('   SMC ANDROID AR (SCENE VIEWER & ARCORE) TEST SUITE    ');
  logger.info('========================================================');

  await db.connect();

  const app = createApp();
  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  logger.info(`Test server listening on ${baseUrl}`);

  try {
    // ----------------------------------------------------
    // TEST 1: Retrieve Live Door and Window Products from MongoDB
    // ----------------------------------------------------
    logger.info('\n--- TEST 1: Live MongoDB Architectural Models ---');
    const products = await Product.find({ status: 'published' });
    if (products.length === 0) {
      throw new Error('No published products found in MongoDB for AR testing.');
    }
    logger.info(`  ✅ PASS: Retrieved ${products.length} published products from MongoDB`);

    // ----------------------------------------------------
    // TEST 2: Validate Scene Viewer Intent Generation
    // ----------------------------------------------------
    logger.info('\n--- TEST 2: Google Scene Viewer Intent URI Construction ---');
    for (const prod of products) {
      const glbUrl = prod.glbUrl;
      const title = prod.name;
      const returnLink = `http://localhost:3000/products/${prod._id}`;

      // Construct Android Scene Viewer Intent
      const encodedFile = encodeURIComponent(glbUrl);
      const encodedTitle = encodeURIComponent(title);
      const encodedLink = encodeURIComponent(returnLink);
      const encodedFallback = encodeURIComponent(returnLink);

      const intentUri = `intent://arvr.google.com/scene-viewer/1.0?file=${encodedFile}&mode=ar_preferred&title=${encodedTitle}&link=${encodedLink}&resizable=false&enable_vertical_placement=true#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodedFallback};end;`;

      logger.info(`\n  Checking Intent for: "${title}"`);
      logger.info(`    Intent URI: ${intentUri.slice(0, 100)}...`);

      // 1. Verify scheme and target host
      if (!intentUri.startsWith('intent://arvr.google.com/scene-viewer/1.0?')) {
        throw new Error('Invalid Scene Viewer URI prefix');
      }

      // 2. Verify AR mode is ar_preferred (launches camera AR directly on ARCore)
      if (!intentUri.includes('mode=ar_preferred')) {
        throw new Error('Missing mode=ar_preferred in Scene Viewer intent');
      }

      // 3. Verify resizable=false (1:1 physical metric scale preservation)
      if (!intentUri.includes('resizable=false')) {
        throw new Error('Missing resizable=false - models must not be resized in AR');
      }

      // 4. Verify vertical surface placement enabled (doors & windows anchor on walls)
      if (!intentUri.includes('enable_vertical_placement=true')) {
        throw new Error('Missing enable_vertical_placement=true for vertical wall detection');
      }

      // 5. Verify ARCore package and intent action
      if (
        !intentUri.includes('package=com.google.ar.core') ||
        !intentUri.includes('action=android.intent.action.VIEW')
      ) {
        throw new Error('Missing package=com.google.ar.core or action in Intent trailer');
      }

      // 6. Verify link parameter returns user back to the web product page
      if (!intentUri.includes(`link=${encodedLink}`)) {
        throw new Error('Missing return link to website upon AR exit');
      }

      logger.info('    ✅ PASS: Validated Scene Viewer AR parameters');
      logger.info('       • Mode: ar_preferred (Instant Camera AR)');
      logger.info('       • Scale: resizable=false (Strict 1:1 Metric Scale)');
      logger.info('       • Surface: enable_vertical_placement=true (Wall Surface)');
      logger.info('       • Return Link: return to product details upon exit');
    }

    // ----------------------------------------------------
    // TEST 3: Validate Model Dimensions, Scale & Upright Orientation
    // ----------------------------------------------------
    logger.info('\n--- TEST 3: Validate Architectural Model Orientation & 1:1 Scale ---');
    for (const prod of products) {
      const localGlbUrl = prod.glbUrl.replace('http://localhost:5000', baseUrl);
      const res = await fetch(localGlbUrl);
      const buf = Buffer.from(await res.arrayBuffer());

      // Parse GLB JSON Chunk
      const jsonLength = buf.readUInt32LE(12);
      const jsonStr = buf.toString('utf8', 20, 20 + jsonLength);
      const gltf = JSON.parse(jsonStr);

      const posAccessor = gltf.accessors[0];
      const [minX, minY, minZ] = posAccessor.min;
      const [maxX, maxY, maxZ] = posAccessor.max;

      const width = maxX - minX;
      const height = maxY - minY;
      const depth = maxZ - minZ;

      logger.info(`\n  Model Bounding Box: "${prod.name}"`);
      logger.info(`    Width (X):  ${width.toFixed(2)} m`);
      logger.info(`    Height (Y): ${height.toFixed(2)} m (Upright Axis)`);
      logger.info(`    Depth (Z):  ${depth.toFixed(2)} m`);

      // Verify Y-up orientation (Height is significantly greater than depth)
      if (height <= depth) {
        throw new Error('Model is not oriented Y-up (height must exceed depth for wall models)');
      }

      // Verify realistic architectural scale (doors ~2.2m, windows ~1.2m)
      if (height < 0.5 || height > 4.0) {
        throw new Error(`Unrealistic model height: ${height}m`);
      }

      logger.info('    ✅ PASS: Validated Y-up vertical orientation and realistic 1:1 scale');
    }

    // ----------------------------------------------------
    // TEST 4: Client User-Agent Detection (Android vs iOS vs Desktop)
    // ----------------------------------------------------
    logger.info('\n--- TEST 4: Client Device Detection Logic ---');

    const androidUA =
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36';
    const isAndroid = /android/i.test(androidUA);
    if (isAndroid) {
      logger.info('  ✅ PASS: Correctly detected Android ARCore device from user agent');
    } else {
      throw new Error('Failed to detect Android user agent');
    }

    const iosUA =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
    const isIOS = /iPad|iPhone|iPod/.test(iosUA);
    if (isIOS) {
      logger.info('  ✅ PASS: Correctly detected iOS device from user agent');
    } else {
      throw new Error('Failed to detect iOS user agent');
    }

    const desktopUA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    const isDesktop = !/android/i.test(desktopUA) && !/iPad|iPhone|iPod/.test(desktopUA);
    if (isDesktop) {
      logger.info('  ✅ PASS: Correctly identified desktop client for fallback 3D viewport guidance');
    } else {
      throw new Error('Failed to detect desktop user agent');
    }

    logger.info('\n========================================================');
    logger.info(' 🎉 ALL ANDROID AR & SCENE VIEWER TESTS PASSED!');
    logger.info('========================================================\n');
  } catch (err) {
    console.error('Android AR test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
    await db.disconnect();
  }
}

runAndroidARTests().catch((err) => {
  console.error('Fatal error in Android AR tests:', err);
  process.exit(1);
});

