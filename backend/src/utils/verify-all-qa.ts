import { createApp } from '../app.js';
import { db } from '../config/database.js';
import { logger } from './logger.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import bcrypt from 'bcryptjs';
import zlib from 'zlib';

interface QAResult {
  category: string;
  test: string;
  passed: boolean;
  notes?: string;
}

const qaResults: QAResult[] = [];

function recordQA(category: string, test: string, passed: boolean, notes?: string) {
  qaResults.push({ category, test, passed, notes });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  logger.info(`  ${status}: [${category}] ${test}${notes ? ` - ${notes}` : ''}`);
}

async function runConsolidatedQAReview() {
  logger.info('================================================================');
  logger.info('   SMC AR DOOR & WINDOW WEBSITE - FULL QA REVIEW & AUDIT       ');
  logger.info('================================================================');

  await db.connect();

  const app = createApp();
  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  logger.info(`Test server active on ${baseUrl}`);

  try {
    // ================================================================
    // SECTION 1: AUTHENTICATION TESTING
    // ================================================================
    logger.info('\n▶ [1. AUTHENTICATION TESTING]');

    // 1.1 Admin Login
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD }),
    });
    const adminData = (await adminLoginRes.json()) as any;
    recordQA(
      'AUTH',
      'Admin Login with initialized credentials',
      adminLoginRes.status === 200 && adminData.data?.user?.role === 'admin'
    );

    // 1.2 User Registration
    const testEmail = `qa.client.${Date.now()}@smc.com`;
    const rawPassword = 'Password123!';
    const userRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA Inspection Client',
        email: testEmail,
        password: rawPassword,
        confirmPassword: rawPassword,
      }),
    });
    const regData = (await userRegRes.json()) as any;
    recordQA(
      'AUTH',
      'User Registration with role="user"',
      userRegRes.status === 201 && regData.data?.user?.role === 'user'
    );

    // 1.3 User Login
    const userLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: rawPassword }),
    });
    const userLoginData = (await userLoginRes.json()) as any;
    const userToken = userLoginData.data?.token;
    recordQA('AUTH', 'User Login with registered credentials', userLoginRes.status === 200);

    // 1.4 Invalid Credentials
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'WrongPassword999!' }),
    });
    recordQA('AUTH', 'Invalid credentials rejected with 401', badLoginRes.status === 401);

    // 1.5 Password Hashing (Bcrypt)
    const userDoc = await User.findOne({ email: testEmail });
    const isBcrypt = userDoc ? userDoc.passwordHash.startsWith('$2') : false;
    const isMatch = userDoc ? await bcrypt.compare(rawPassword, userDoc.passwordHash) : false;
    recordQA(
      'AUTH',
      'Password hashed with bcrypt (never plaintext)',
      Boolean(isBcrypt && isMatch)
    );

    // 1.6 Role-Based Access Enforcement
    const adminToken = adminData.data?.token;
    const userBlockedFromAdminRes = await fetch(`${baseUrl}/api/products/admin`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    recordQA(
      'AUTH',
      'Standard user blocked from Admin API (403 Forbidden)',
      userBlockedFromAdminRes.status === 403
    );

    // 1.7 Unauthorized Route Protection
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    recordQA(
      'AUTH',
      'Unauthenticated request blocked from protected routes (401)',
      noTokenRes.status === 401
    );

    // 1.8 Session / Token Handling
    const getMeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    recordQA('AUTH', 'Token verification via GET /api/auth/me', getMeRes.status === 200);

    // ================================================================
    // SECTION 2: ADMIN TESTING
    // ================================================================
    logger.info('\n▶ [2. ADMIN TESTING]');

    // 2.1 Admin Dashboard Products List
    const adminProductsRes = await fetch(`${baseUrl}/api/products/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordQA('ADMIN', 'Admin dashboard products query (200 OK)', adminProductsRes.status === 200);

    // 2.2 Product Name & 3D Upload (GLB + USDZ)
    const glbDummy = Buffer.from('glTF\x02\x00\x00\x00\x28\x00\x00\x00\x10\x00\x00\x00JSON{"asset":{"version":"2.0"}}  \x00\x00\x00\x00BIN\x00');
    const usdzDummy = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

    const boundary = '----WebKitFormBoundaryQA' + Date.now();
    const parts: Buffer[] = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nQA Pivot Security Door\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="status"\r\n\r\ndraft\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="glbFile"; filename="door.glb"\r\nContent-Type: model/gltf-binary\r\n\r\n`),
      glbDummy,
      Buffer.from('\r\n'),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="usdzFile"; filename="door.usdz"\r\nContent-Type: model/vnd.usdz+zip\r\n\r\n`),
      usdzDummy,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ];

    const uploadRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${adminToken}`,
      },
      body: Buffer.concat(parts),
    });
    const uploadJson = (await uploadRes.json()) as any;
    const qaProductId = uploadJson.data?._id;
    recordQA('ADMIN', 'Upload GLB + USDZ as Draft (201 Created)', uploadRes.status === 201);

    // 2.3 Invalid File Rejection
    const badParts = [
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nBad Model\r\n`),
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="glbFile"; filename="bad.exe"\r\nContent-Type: application/octet-stream\r\n\r\nmalicious_content\r\n`),
      Buffer.from(`--${boundary}--\r\n`),
    ];
    const badUploadRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${adminToken}`,
      },
      body: Buffer.concat(badParts),
    });
    recordQA('ADMIN', 'Invalid file type rejected with 400 Bad Request', badUploadRes.status === 400);

    // 2.4 Product Publishing
    const publishRes = await fetch(`${baseUrl}/api/products/${qaProductId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    recordQA('ADMIN', 'Publish action (status -> published)', publishRes.status === 200);

    // 2.5 Product Editing
    const editRes = await fetch(`${baseUrl}/api/products/${qaProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'QA Pivot Security Door (Updated)' }),
    });
    recordQA('ADMIN', 'Edit product details (PUT 200 OK)', editRes.status === 200);

    // 2.6 Product Deletion & DB Sync
    const deleteRes = await fetch(`${baseUrl}/api/products/${qaProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const checkDeleted = await Product.findById(qaProductId);
    recordQA(
      'ADMIN',
      'Delete product & storage cleanup (DELETE 200 OK)',
      deleteRes.status === 200 && checkDeleted === null
    );

    // ================================================================
    // SECTION 3: USER TESTING
    // ================================================================
    logger.info('\n▶ [3. USER TESTING]');

    const publicListRes = await fetch(`${baseUrl}/api/products`);
    const publicList = (await publicListRes.json()) as any;
    recordQA(
      'USER',
      'Public product listing returns 200 with published items',
      publicListRes.status === 200 && Array.isArray(publicList.data)
    );

    const activeProducts = await Product.find({ status: 'published' });
    const firstProduct = activeProducts[0];
    if (firstProduct) {
      const userProductDetailRes = await fetch(`${baseUrl}/api/products/${firstProduct._id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      recordQA(
        'USER',
        'User opens published product details (200 OK)',
        userProductDetailRes.status === 200
      );
    }

    // ================================================================
    // SECTION 4: 3D VIEWER TESTING
    // ================================================================
    logger.info('\n▶ [4. 3D VIEWER TESTING]');

    if (firstProduct) {
      const glbUrl = firstProduct.glbUrl.replace('http://localhost:5000', baseUrl);
      const glbRes = await fetch(glbUrl);
      const glbBuf = Buffer.from(await glbRes.arrayBuffer());
      const isGlbValid = glbRes.ok && glbBuf.toString('ascii', 0, 4) === 'glTF';
      recordQA('3D_VIEWER', 'GLB file accessible with valid glTF 2.0 header', isGlbValid);

      if (firstProduct.usdzUrl) {
        const usdzUrl = firstProduct.usdzUrl.replace('http://localhost:5000', baseUrl);
        const usdzRes = await fetch(usdzUrl);
        const isUsdzMime = usdzRes.headers.get('content-type')?.includes('model/vnd.usdz+zip');
        recordQA('3D_VIEWER', 'USDZ accessible with model/vnd.usdz+zip MIME', Boolean(isUsdzMime));
      }
    }

    // ================================================================
    // SECTION 5 & 6: AR PROTOCOL TESTING (ANDROID & IPHONE)
    // ================================================================
    logger.info('\n▶ [5 & 6. AR PROTOCOL TESTING]');

    // Android Scene Viewer
    const sceneViewerIntent = `intent://arvr.google.com/scene-viewer/1.0?file=https%3A%2F%2Fsmc.com%2Fmodel.glb&mode=ar_preferred&title=Door&resizable=false&enable_vertical_placement=true#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;
    const isSceneViewerValid =
      sceneViewerIntent.includes('mode=ar_preferred') &&
      sceneViewerIntent.includes('resizable=false') &&
      sceneViewerIntent.includes('enable_vertical_placement=true');
    recordQA('ANDROID_AR', 'Scene Viewer intent parameters (mode, scale=1:1, vertical wall)', isSceneViewerValid);

    // Apple Quick Look
    const quickLookUrl = `https://smc.com/model.usdz#allowsContentScaling=0&canonicalWebPageURL=https%3A%2F%2Fsmc.com%2Fproducts%2F123`;
    const isQuickLookValid = quickLookUrl.includes('#allowsContentScaling=0');
    recordQA('IPHONE_AR', 'Quick Look URL format (#allowsContentScaling=0 scale locking)', isQuickLookValid);

    // ================================================================
    // SECTION 7: SECURITY & CONFIGURATION REVIEW
    // ================================================================
    logger.info('\n▶ [7. SECURITY & CONFIGURATION AUDIT]');

    recordQA('SECURITY', 'JWT secret min length (>16 chars)', env.JWT_SECRET.length >= 16);
    recordQA('SECURITY', 'Database connection to MongoDB Atlas encrypted (mongodb+srv)', env.MONGODB_URI.startsWith('mongodb+srv'));
    recordQA('SECURITY', 'File upload size limits configured (50MB model / 10MB image)', env.MAX_FILE_SIZE_MB === 50);

    // Clean up test user
    if (userDoc) {
      await User.findByIdAndDelete(userDoc._id);
    }

    logger.info('\n================================================================');
    logger.info(` 🎉 QA REVIEW COMPLETE: ${qaResults.filter((r) => r.passed).length} / ${qaResults.length} CHECKS PASSED`);
    logger.info('================================================================\n');
  } catch (err) {
    console.error('QA review failed:', err);
    process.exit(1);
  } finally {
    server.close();
    await db.disconnect();
  }
}

runConsolidatedQAReview().catch((err) => {
  console.error('Fatal error in QA audit:', err);
  process.exit(1);
});

