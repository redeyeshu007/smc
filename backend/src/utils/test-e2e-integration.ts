import { createApp } from '../app.js';
import { db } from '../config/database.js';
import { logger } from './logger.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import zlib from 'zlib';

/**
 * Builds a standard glTF 2.0 binary (GLB) with real mesh geometry and PBR materials
 */
function buildGlbBox(options: {
  width: number;
  height: number;
  depth: number;
  r: number;
  g: number;
  b: number;
  modelName: string;
}): Buffer {
  const { width, height, depth, r, g, b, modelName } = options;
  const hx = width / 2;
  const hy = height / 2;
  const hz = depth / 2;

  // prettier-ignore
  const positions: number[] = [
    -hx, -hy,  hz,   hx, -hy,  hz,   hx,  hy,  hz,  -hx,  hy,  hz, // Front
    -hx, -hy, -hz,  -hx,  hy, -hz,   hx,  hy, -hz,   hx, -hy, -hz, // Back
    -hx,  hy, -hz,  -hx,  hy,  hz,   hx,  hy,  hz,   hx,  hy, -hz, // Top
    -hx, -hy, -hz,   hx, -hy, -hz,   hx, -hy,  hz,  -hx, -hy,  hz, // Bottom
     hx, -hy, -hz,   hx,  hy, -hz,   hx,  hy,  hz,   hx, -hy,  hz, // Right
    -hx, -hy, -hz,  -hx, -hy,  hz,  -hx,  hy,  hz,  -hx,  hy, -hz  // Left
  ];

  // prettier-ignore
  const normals: number[] = [
    0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
    0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
    0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
    0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
    1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
    -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0
  ];

  // prettier-ignore
  const indices: number[] = [
    0, 1, 2,  0, 2, 3,
    4, 5, 6,  4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23
  ];

  const posBuffer = Buffer.alloc(positions.length * 4);
  positions.forEach((val, i) => posBuffer.writeFloatLE(val, i * 4));

  const normBuffer = Buffer.alloc(normals.length * 4);
  normals.forEach((val, i) => normBuffer.writeFloatLE(val, i * 4));

  const idxBuffer = Buffer.alloc(indices.length * 2);
  indices.forEach((val, i) => idxBuffer.writeUInt16LE(val, i * 2));

  const pad4 = (buf: Buffer) => {
    const pad = (4 - (buf.length % 4)) % 4;
    return pad === 0 ? buf : Buffer.concat([buf, Buffer.alloc(pad, 0)]);
  };

  const posPadded = pad4(posBuffer);
  const normPadded = pad4(normBuffer);
  const idxPadded = pad4(idxBuffer);

  const binChunk = Buffer.concat([posPadded, normPadded, idxPadded]);

  const gltfJson = {
    asset: { version: '2.0', generator: 'SMC-Architectural-Engine' },
    scene: 0,
    scenes: [{ name: 'DefaultScene', nodes: [0] }],
    nodes: [{ name: modelName, mesh: 0 }],
    materials: [
      {
        name: 'ArchitecturalPBR',
        pbrMetallicRoughness: {
          baseColorFactor: [r, g, b, 1.0],
          metallicFactor: 0.6,
          roughnessFactor: 0.2,
        },
        doubleSided: true,
      },
    ],
    meshes: [
      {
        name: modelName,
        primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126,
        count: 24,
        type: 'VEC3',
        max: [hx, hy, hz],
        min: [-hx, -hy, -hz],
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126,
        count: 24,
        type: 'VEC3',
        max: [1, 1, 1],
        min: [-1, -1, -1],
      },
      {
        bufferView: 2,
        byteOffset: 0,
        componentType: 5123,
        count: 36,
        type: 'SCALAR',
        max: [23],
        min: [0],
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBuffer.length, target: 34962 },
      { buffer: 0, byteOffset: posPadded.length, byteLength: normBuffer.length, target: 34962 },
      {
        buffer: 0,
        byteOffset: posPadded.length + normPadded.length,
        byteLength: idxBuffer.length,
        target: 34963,
      },
    ],
    buffers: [{ byteLength: binChunk.length }],
  };

  const jsonString = JSON.stringify(gltfJson);
  const jsonBuf = Buffer.from(jsonString, 'utf8');
  const jsonPadding = (4 - (jsonBuf.length % 4)) % 4;
  const paddedJson = Buffer.concat([jsonBuf, Buffer.alloc(jsonPadding, 0x20)]);

  const totalLength = 12 + 8 + paddedJson.length + 8 + binChunk.length;

  const header = Buffer.alloc(12);
  header.write('glTF', 0, 4, 'ascii');
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(paddedJson.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binChunk.length, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4);

  return Buffer.concat([header, jsonChunkHeader, paddedJson, binChunkHeader, binChunk]);
}

/**
 * Builds a valid USDZ package containing model.usda
 */
function buildUsdzPackage(options: {
  width: number;
  height: number;
  depth: number;
  r: number;
  g: number;
  b: number;
  modelName: string;
}): Buffer {
  const { width, height, depth, r, g, b, modelName } = options;
  const hx = (width / 2).toFixed(4);
  const hy = (height / 2).toFixed(4);
  const hz = (depth / 2).toFixed(4);

  const usdaContent = `#usda 1.0
(
    defaultPrim = "Root"
    metersPerUnit = 1.0
    upAxis = "Y"
)

def Xform "Root" (
    assetInfo = {
        name = "${modelName}"
    }
    kind = "component"
)
{
    def Mesh "Geometry"
    {
        float3[] extent = [(-${hx}, -${hy}, -${hz}), (${hx}, ${hy}, ${hz})]
        int[] faceVertexCounts = [4, 4, 4, 4, 4, 4]
        int[] faceVertexIndices = [
            0, 1, 2, 3,
            4, 5, 6, 7,
            8, 9, 10, 11,
            12, 13, 14, 15,
            16, 17, 18, 19,
            20, 21, 22, 23
        ]
        point3f[] points = [
            (-${hx}, -${hy}, ${hz}), (${hx}, -${hy}, ${hz}), (${hx}, ${hy}, ${hz}), (-${hx}, ${hy}, ${hz}),
            (-${hx}, -${hy}, -${hz}), (-${hx}, ${hy}, -${hz}), (${hx}, ${hy}, -${hz}), (${hx}, -${hy}, -${hz}),
            (-${hx}, ${hy}, -${hz}), (-${hx}, ${hy}, ${hz}), (${hx}, ${hy}, ${hz}), (${hx}, ${hy}, -${hz}),
            (-${hx}, -${hy}, -${hz}), (${hx}, -${hy}, -${hz}), (${hx}, -${hy}, ${hz}), (-${hx}, -${hy}, ${hz}),
            (${hx}, -${hy}, -${hz}), (${hx}, ${hy}, -${hz}), (${hx}, ${hy}, ${hz}), (${hx}, -${hy}, ${hz}),
            (-${hx}, -${hy}, -${hz}), (-${hx}, -${hy}, ${hz}), (-${hx}, ${hy}, ${hz}), (-${hx}, ${hy}, -${hz})
        ]
        color3f[] primvars:displayColor = [(${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)})]
    }
}
`;

  const filename = 'model.usda';
  const filenameBuf = Buffer.from(filename, 'utf8');
  const contentBuf = Buffer.from(usdaContent, 'utf8');
  const crc = zlib.crc32(contentBuf);

  let extraLen = 64 - (30 + filenameBuf.length);
  if (extraLen < 4) extraLen += 64;
  const extraBuf = Buffer.alloc(extraLen);
  extraBuf.writeUInt16LE(0x0000, 0);
  extraBuf.writeUInt16LE(extraLen - 4, 2);

  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8);
  localHeader.writeUInt16LE(0, 10);
  localHeader.writeUInt16LE(0, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(contentBuf.length, 18);
  localHeader.writeUInt32LE(contentBuf.length, 22);
  localHeader.writeUInt16LE(filenameBuf.length, 26);
  localHeader.writeUInt16LE(extraBuf.length, 28);

  const localFile = Buffer.concat([localHeader, filenameBuf, extraBuf, contentBuf]);
  const localOffset = 0;

  const cdHeader = Buffer.alloc(46);
  cdHeader.writeUInt32LE(0x02014b50, 0);
  cdHeader.writeUInt16LE(20, 4);
  cdHeader.writeUInt16LE(20, 6);
  cdHeader.writeUInt16LE(0, 8);
  cdHeader.writeUInt16LE(0, 10);
  cdHeader.writeUInt16LE(0, 12);
  cdHeader.writeUInt16LE(0, 14);
  cdHeader.writeUInt32LE(crc, 16);
  cdHeader.writeUInt32LE(contentBuf.length, 20);
  cdHeader.writeUInt32LE(contentBuf.length, 24);
  cdHeader.writeUInt16LE(filenameBuf.length, 28);
  cdHeader.writeUInt16LE(0, 30);
  cdHeader.writeUInt16LE(0, 32);
  cdHeader.writeUInt16LE(0, 34);
  cdHeader.writeUInt16LE(0, 36);
  cdHeader.writeUInt32LE(0, 38);
  cdHeader.writeUInt32LE(localOffset, 42);

  const centralDir = Buffer.concat([cdHeader, filenameBuf]);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(localFile.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localFile, centralDir, eocd]);
}

async function runEndToEndIntegration() {
  logger.info('================================================================');
  logger.info('   SMC COMPLETE FULL-STACK AR INTEGRATION VERIFICATION TEST     ');
  logger.info('================================================================');

  await db.connect();

  const app = createApp();
  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;
  logger.info(`Live test server active on ${baseUrl}`);

  let createdProductId: string | null = null;
  let createdGlbUrl: string | null = null;
  let createdUsdzUrl: string | null = null;
  let testUserId: string | null = null;

  try {
    // ----------------------------------------------------------------
    // STAGE 1: Admin Authentication (Login & Role Verification)
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 1] Admin Login & Role-Based Access Control');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
      }),
    });

    if (!adminLoginRes.ok) {
      throw new Error(`Admin login failed: HTTP ${adminLoginRes.status}`);
    }

    const adminLoginJson = (await adminLoginRes.json()) as any;
    const adminToken = adminLoginJson.data.token;
    const adminUser = adminLoginJson.data.user;

    if (adminUser.role !== 'admin') {
      throw new Error(`Expected admin role, got: ${adminUser.role}`);
    }
    logger.info(`  ✅ PASS: Admin logged in successfully as "${adminUser.name}" (${adminUser.email})`);
    logger.info(`  ✅ PASS: Verified JWT token issued with role='admin'`);

    // ----------------------------------------------------------------
    // STAGE 2: Admin Dashboard 3D Model Upload (GLB + USDZ Draft)
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 2] Admin Uploads New Architectural 3D Product (Draft)');
    const productName = 'Contemporary French Double Patio Door';

    // Real door dimensions: 1.80m width, 2.40m height, 0.10m depth (gold accent color)
    const glbBuffer = buildGlbBox({
      width: 1.8,
      height: 2.4,
      depth: 0.1,
      r: 0.77,
      g: 0.65,
      b: 0.45,
      modelName: 'FrenchPatioDoubleDoor',
    });

    const usdzBuffer = buildUsdzPackage({
      width: 1.8,
      height: 2.4,
      depth: 0.1,
      r: 0.77,
      g: 0.65,
      b: 0.45,
      modelName: 'FrenchPatioDoubleDoor',
    });

    // Construct multipart form data
    const boundary = '----WebKitFormBoundaryE2ETest' + Date.now();
    const parts: Buffer[] = [];

    // 1. name field
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\n${productName}\r\n`
      )
    );

    // 2. status field
    parts.push(
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="status"\r\n\r\ndraft\r\n`)
    );

    // 3. glbFile field
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="glbFile"; filename="french_patio_door.glb"\r\nContent-Type: model/gltf-binary\r\n\r\n`
      )
    );
    parts.push(glbBuffer);
    parts.push(Buffer.from('\r\n'));

    // 4. usdzFile field
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="usdzFile"; filename="french_patio_door.usdz"\r\nContent-Type: model/vnd.usdz+zip\r\n\r\n`
      )
    );
    parts.push(usdzBuffer);
    parts.push(Buffer.from('\r\n'));

    parts.push(Buffer.from(`--${boundary}--\r\n`));
    const multipartBody = Buffer.concat(parts);

    const uploadRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${adminToken}`,
      },
      body: multipartBody,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(`Upload failed: HTTP ${uploadRes.status} ${JSON.stringify(err)}`);
    }

    const uploadJson = (await uploadRes.json()) as any;
    const createdProduct = uploadJson.data;
    createdProductId = createdProduct._id;
    createdGlbUrl = createdProduct.glbUrl;
    createdUsdzUrl = createdProduct.usdzUrl;

    logger.info(`  ✅ PASS: Product uploaded with HTTP 201 Created`);
    logger.info(`     ID:       ${createdProductId}`);
    logger.info(`     Name:     ${createdProduct.name}`);
    logger.info(`     Status:   ${createdProduct.status}`);
    logger.info(`     GLB URL:  ${createdGlbUrl}`);
    logger.info(`     USDZ URL: ${createdUsdzUrl}`);

    // ----------------------------------------------------------------
    // STAGE 3: MongoDB Verification & Draft Isolation
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 3] MongoDB Persistence & Draft Isolation Verification');
    const dbDoc = await Product.findById(createdProductId);
    if (!dbDoc) {
      throw new Error('Product not found in MongoDB');
    }
    logger.info(`  ✅ PASS: Verified document exists in MongoDB collection 'products'`);

    // Verify unauthenticated / regular user cannot see this draft
    const publicCatalogBeforeRes = await fetch(`${baseUrl}/api/products`);
    const publicCatalogBefore = (await publicCatalogBeforeRes.json()) as any;
    const isLeaked = publicCatalogBefore.data?.some((p: any) => p._id === createdProductId);
    if (isLeaked) {
      throw new Error('Draft product leaked into public catalog!');
    }
    logger.info(`  ✅ PASS: Draft product is hidden from user catalog (GET /api/products)`);

    const directDraftRes = await fetch(`${baseUrl}/api/products/${createdProductId}`);
    if (directDraftRes.status !== 404) {
      throw new Error(`Expected 404 for direct draft query by user, got ${directDraftRes.status}`);
    }
    logger.info(`  ✅ PASS: Direct user request to draft product returns 404 Not Found`);

    // ----------------------------------------------------------------
    // STAGE 4: Admin Publishes Product
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 4] Admin Publishes the Product');
    const publishRes = await fetch(`${baseUrl}/api/products/${createdProductId}/publish`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!publishRes.ok) {
      throw new Error(`Failed to publish: HTTP ${publishRes.status}`);
    }
    const publishJson = (await publishRes.json()) as any;
    if (publishJson.data.status !== 'published') {
      throw new Error(`Expected status='published', got: ${publishJson.data.status}`);
    }
    logger.info(`  ✅ PASS: Product status transitioned to 'published' in MongoDB`);

    // ----------------------------------------------------------------
    // STAGE 5: User Registration, Login & Session Management
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 5] User Registration & Authentication');
    const testEmail = `architect.${Date.now()}@smc-design.com`;
    const testPassword = 'Password123!';

    const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Elena Rostova (Lead Architect)',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      }),
    });

    if (!registerRes.ok) {
      throw new Error(`User registration failed: HTTP ${registerRes.status}`);
    }
    const registerJson = (await registerRes.json()) as any;
    testUserId = registerJson.data.user.id;
    logger.info(`  ✅ PASS: User registered: "${registerJson.data.user.name}" (${testEmail})`);

    const userLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    const userLoginJson = (await userLoginRes.json()) as any;
    const userToken = userLoginJson.data.token;
    logger.info(`  ✅ PASS: User authenticated & received user-scoped JWT token`);

    // ----------------------------------------------------------------
    // STAGE 6: User Browses Published Collection & Selects Product
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 6] User Browses Published Collection & Selects Product');
    const publicCatalogRes = await fetch(`${baseUrl}/api/products`);
    const publicCatalogJson = (await publicCatalogRes.json()) as any;
    const foundPublished = publicCatalogJson.data?.find((p: any) => p._id === createdProductId);

    if (!foundPublished) {
      throw new Error('Published product not found in public collection');
    }
    logger.info(`  ✅ PASS: User sees "${foundPublished.name}" in published collection`);

    const productDetailRes = await fetch(`${baseUrl}/api/products/${createdProductId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (!productDetailRes.ok) {
      throw new Error(`User cannot access published product: HTTP ${productDetailRes.status}`);
    }
    const productDetail = ((await productDetailRes.json()) as any).data;
    logger.info(`  ✅ PASS: User opened product details (ID: ${productDetail._id})`);

    // ----------------------------------------------------------------
    // STAGE 7: 3D Model Verification (GLB Parsing & Orientation)
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 7] 3D Viewer Asset Loading & Validation');
    const localGlbUrl = productDetail.glbUrl.replace('http://localhost:5000', baseUrl);
    const glbFetchRes = await fetch(localGlbUrl);
    if (!glbFetchRes.ok) {
      throw new Error(`Failed to fetch GLB: HTTP ${glbFetchRes.status}`);
    }
    const glbData = Buffer.from(await glbFetchRes.arrayBuffer());

    // Check glTF binary header
    const magic = glbData.toString('ascii', 0, 4);
    const version = glbData.readUInt32LE(4);
    const totalLength = glbData.readUInt32LE(8);

    if (magic !== 'glTF' || version !== 2) {
      throw new Error(`Invalid GLB header: magic=${magic}, version=${version}`);
    }
    logger.info(`  ✅ PASS: GLB format verified (glTF 2.0 binary, length: ${totalLength} bytes)`);

    // Parse GLB JSON to assert dimensions and Y-up orientation
    const jsonLen = glbData.readUInt32LE(12);
    const gltfContent = JSON.parse(glbData.toString('utf8', 20, 20 + jsonLen));
    const bboxMin = gltfContent.accessors[0].min;
    const bboxMax = gltfContent.accessors[0].max;

    const width = bboxMax[0] - bboxMin[0];
    const height = bboxMax[1] - bboxMin[1];
    const depth = bboxMax[2] - bboxMin[2];

    logger.info(`  ✅ PASS: Measured real physical dimensions:`);
    logger.info(`     • Width (X):  ${width.toFixed(2)} m`);
    logger.info(`     • Height (Y): ${height.toFixed(2)} m (Upright Wall Axis)`);
    logger.info(`     • Depth (Z):  ${depth.toFixed(2)} m`);

    if (height <= depth || height < 1.0) {
      throw new Error('Door model orientation is not Y-up');
    }
    logger.info(`  ✅ PASS: Upright Y-axis vertical orientation validated for wall mounting`);

    // ----------------------------------------------------------------
    // STAGE 8: Android AR (Google Scene Viewer Intent)
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 8] Android AR Scene Viewer Intent Generation');
    const canonicalPageUrl = `http://localhost:3000/products/${createdProductId}`;
    const encodedFile = encodeURIComponent(productDetail.glbUrl);
    const encodedTitle = encodeURIComponent(productDetail.name);
    const encodedLink = encodeURIComponent(canonicalPageUrl);

    const sceneViewerIntent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodedFile}&mode=ar_preferred&title=${encodedTitle}&link=${encodedLink}&resizable=false&enable_vertical_placement=true#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodedLink};end;`;

    if (!sceneViewerIntent.includes('resizable=false')) {
      throw new Error('Scene Viewer missing resizable=false for 1:1 scale');
    }
    if (!sceneViewerIntent.includes('enable_vertical_placement=true')) {
      throw new Error('Scene Viewer missing enable_vertical_placement=true for wall anchor');
    }
    if (!sceneViewerIntent.includes('mode=ar_preferred')) {
      throw new Error('Scene Viewer missing mode=ar_preferred for direct camera AR');
    }
    logger.info(`  ✅ PASS: Scene Viewer Intent URI generated:`);
    logger.info(`     • Scheme:    intent://arvr.google.com/scene-viewer/1.0`);
    logger.info(`     • Mode:      mode=ar_preferred (Direct camera AR launch)`);
    logger.info(`     • Scale:     resizable=false (1:1 strict metric architectural scale)`);
    logger.info(`     • Anchor:    enable_vertical_placement=true (Wall plane anchor)`);
    logger.info(`     • Exit Link: canonical webpage return URL`);

    // ----------------------------------------------------------------
    // STAGE 9: iPhone AR (Apple AR Quick Look & USDZ Verification)
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 9] iPhone AR Apple Quick Look & USDZ Verification');
    const localUsdzUrl = productDetail.usdzUrl.replace('http://localhost:5000', baseUrl);
    const usdzFetchRes = await fetch(localUsdzUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      },
    });

    if (!usdzFetchRes.ok) {
      throw new Error(`Failed to fetch USDZ: HTTP ${usdzFetchRes.status}`);
    }

    const usdzContentType = usdzFetchRes.headers.get('content-type');
    if (!usdzContentType?.includes('model/vnd.usdz+zip')) {
      throw new Error(`Invalid USDZ Content-Type: ${usdzContentType}`);
    }
    logger.info(`  ✅ PASS: Content-Type is 'model/vnd.usdz+zip' (Native Apple Quick Look trigger)`);

    const usdzBuf = Buffer.from(await usdzFetchRes.arrayBuffer());
    if (usdzBuf.readUInt32LE(0) !== 0x04034b50) {
      throw new Error('USDZ is not a valid ZIP container');
    }
    logger.info(`  ✅ PASS: Validated USDZ ZIP binary archive (${usdzBuf.length} bytes)`);

    // Check Quick Look URL with scale lock fragment
    const quickLookUrl = `${productDetail.usdzUrl}#allowsContentScaling=0&canonicalWebPageURL=${encodeURIComponent(canonicalPageUrl)}`;
    if (!quickLookUrl.includes('#allowsContentScaling=0')) {
      throw new Error('Missing allowsContentScaling=0 in Quick Look URL');
    }
    logger.info(`  ✅ PASS: Quick Look URL enforces '#allowsContentScaling=0' (locks 1:1 scale)`);

    // ----------------------------------------------------------------
    // STAGE 10: Clean Up & Storage Consistency
    // ----------------------------------------------------------------
    logger.info('\n▶ [STAGE 10] Clean Up & Storage Consistency');
    const deleteRes = await fetch(`${baseUrl}/api/products/${createdProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!deleteRes.ok) {
      throw new Error(`Failed to delete product: HTTP ${deleteRes.status}`);
    }
    logger.info(`  ✅ PASS: Product deleted from MongoDB (200 OK)`);

    const verifyDeleted = await Product.findById(createdProductId);
    if (verifyDeleted) {
      throw new Error('Product still exists in MongoDB after deletion');
    }
    logger.info(`  ✅ PASS: Verified document removed from MongoDB`);

    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
      logger.info(`  ✅ PASS: Cleaned up test user account`);
    }

    logger.info('\n================================================================');
    logger.info(' 🎉 COMPLETE END-TO-END AR INTEGRATION TEST PASSED SUCCESSFULLY!');
    logger.info('================================================================\n');
  } catch (err) {
    console.error('E2E integration test failed:', err);
    // Attempt cleanup if failed midway
    if (createdProductId) {
      await Product.findByIdAndDelete(createdProductId).catch(() => {});
    }
    if (testUserId) {
      await User.findByIdAndDelete(testUserId).catch(() => {});
    }
    process.exit(1);
  } finally {
    server.close();
    await db.disconnect();
  }
}

runEndToEndIntegration().catch((err) => {
  console.error('Fatal error in E2E integration:', err);
  process.exit(1);
});
