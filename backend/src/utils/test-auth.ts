import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { seedAdminAccount } from './seed-admin.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureDetails = '') {
  if (condition) {
    logger.info(`  ✅ PASS: ${testName}`);
    results.push({ name: testName, passed: true });
  } else {
    logger.error(`  ❌ FAIL: ${testName} - ${failureDetails}`);
    results.push({ name: testName, passed: false, details: failureDetails });
  }
}

async function request(
  baseUrl: string,
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any }> {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runAuthTestSuite() {
  logger.info('====================================================');
  logger.info('      SMC AUTHENTICATION & RBAC TEST SUITE          ');
  logger.info('====================================================');

  let memoryServer: MongoMemoryServer | null = null;

  // 1. Database Connection
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
      dbName: env.MONGODB_DB_NAME,
    });
    logger.info(`Connected to target MongoDB at ${env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
  } catch {
    logger.warn('Target MongoDB unreachable. Launching in-memory test instance...');
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    logger.info(`Connected to In-Memory MongoDB at ${memoryServer.getUri()}`);
  }

  // 2. Seed Admin
  await seedAdminAccount();

  // 3. Start Test HTTP Server
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  logger.info(`Test server listening on ${baseUrl}`);

  try {
    // ----------------------------------------------------
    // TEST 1: Admin Login
    // ----------------------------------------------------
    const adminLoginRes = await request(baseUrl, 'POST', '/api/auth/login', {
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
    });
    assert(
      adminLoginRes.status === 200 &&
      adminLoginRes.data?.data?.user?.role === 'admin' &&
      typeof adminLoginRes.data?.data?.token === 'string',
      'Admin Login with initialized credentials',
      JSON.stringify(adminLoginRes.data)
    );
    const adminToken = adminLoginRes.data?.data?.token;

    // ----------------------------------------------------
    // TEST 2: User Registration
    // ----------------------------------------------------
    const testUserEmail = `architect-${Date.now()}@studio.com`;
    const userRegRes = await request(baseUrl, 'POST', '/api/auth/register', {
      name: 'Elena Rostova',
      email: testUserEmail,
      password: 'UserSecret2026',
      confirmPassword: 'UserSecret2026',
    });
    assert(
      userRegRes.status === 201 &&
      userRegRes.data?.data?.user?.role === 'user' &&
      userRegRes.data?.data?.user?.email === testUserEmail &&
      typeof userRegRes.data?.data?.token === 'string',
      'User Registration with valid credentials (role strictly set to user)',
      JSON.stringify(userRegRes.data)
    );
    const userToken = userRegRes.data?.data?.token;

    // ----------------------------------------------------
    // TEST 3: Duplicate Email Prevention
    // ----------------------------------------------------
    const dupRegRes = await request(baseUrl, 'POST', '/api/auth/register', {
      name: 'Elena Rostova Copy',
      email: testUserEmail,
      password: 'AnotherPassword123',
      confirmPassword: 'AnotherPassword123',
    });
    assert(
      dupRegRes.status === 409,
      'Duplicate Email Registration blocked with 409 Conflict',
      JSON.stringify(dupRegRes.data)
    );

    // ----------------------------------------------------
    // TEST 4: Password Mismatch Validation
    // ----------------------------------------------------
    const mismatchRes = await request(baseUrl, 'POST', '/api/auth/register', {
      name: 'Elena Rostova',
      email: `test-mismatch-${Date.now()}@studio.com`,
      password: 'PasswordA123',
      confirmPassword: 'PasswordB456',
    });
    assert(
      mismatchRes.status === 422,
      'Password Mismatch blocked with 422 Unprocessable Entity',
      JSON.stringify(mismatchRes.data)
    );

    // ----------------------------------------------------
    // TEST 5: User Login
    // ----------------------------------------------------
    const userLoginRes = await request(baseUrl, 'POST', '/api/auth/login', {
      email: testUserEmail,
      password: 'UserSecret2026',
    });
    assert(
      userLoginRes.status === 200 &&
      userLoginRes.data?.data?.user?.email === testUserEmail &&
      userLoginRes.data?.data?.user?.role === 'user',
      'User Login with registered credentials',
      JSON.stringify(userLoginRes.data)
    );

    // ----------------------------------------------------
    // TEST 6: Invalid Password Rejection
    // ----------------------------------------------------
    const invalidPwRes = await request(baseUrl, 'POST', '/api/auth/login', {
      email: testUserEmail,
      password: 'WRONG_PASSWORD_XYZ',
    });
    assert(
      invalidPwRes.status === 401 &&
      invalidPwRes.data?.message?.includes('Invalid email or password'),
      'Invalid password rejected with 401 Unauthorized',
      JSON.stringify(invalidPwRes.data)
    );

    // ----------------------------------------------------
    // TEST 7: GET /api/auth/me Profile Verification
    // ----------------------------------------------------
    const meRes = await request(baseUrl, 'GET', '/api/auth/me', undefined, userToken);
    assert(
      meRes.status === 200 && meRes.data?.data?.email === testUserEmail,
      'GET /api/auth/me returns authenticated user identity',
      JSON.stringify(meRes.data)
    );

    // ----------------------------------------------------
    // TEST 8: Unauthorized Admin Access (RBAC Enforcement)
    // ----------------------------------------------------
    // Standard user tries to create product on admin route
    const testCategory = await Category.create({
      name: 'Doors',
      slug: `doors-${Date.now()}`,
      type: 'door',
    });

    const userAdminAttempt = await request(
      baseUrl,
      'POST',
      '/api/products',
      {
        title: 'Unauthorized Door',
        sku: `UNAUTH-${Date.now().toString().slice(-4)}`,
        description: 'Testing RBAC restriction',
        productType: 'door',
        subType: 'sliding',
        category: testCategory._id,
        basePrice: 1000,
        dimensions: { defaultWidth: 1000, defaultHeight: 2000, defaultDepth: 50 },
        customizable: {
          widthRange: { min: 800, max: 1200 },
          heightRange: { min: 1800, max: 2200 },
          materials: [],
          hardware: [],
        },
      },
      userToken // User role token
    );
    assert(
      userAdminAttempt.status === 403,
      'Standard User token blocked from Admin product creation with 403 Forbidden',
      JSON.stringify(userAdminAttempt.data)
    );

    // ----------------------------------------------------
    // TEST 9: Authorized Admin Access
    // ----------------------------------------------------
    const adminProductRes = await request(
      baseUrl,
      'POST',
      '/api/products',
      {
        name: 'Architectural Bronze Pivot Door',
        title: 'Architectural Bronze Pivot Door',
        glbUrl: 'https://example.com/models/pivot-door.glb',
        status: 'published',
      },
      adminToken // Admin role token
    );
    assert(
      adminProductRes.status === 201 && adminProductRes.data?.data?.title?.includes('Pivot Door'),
      'Admin token authorized to create products (201 Created)',
      JSON.stringify(adminProductRes.data)
    );

    // Clean up created product & category
    if (adminProductRes.data?.data?._id) {
      await Product.findByIdAndDelete(adminProductRes.data.data._id);
    }
    await Category.findByIdAndDelete(testCategory._id);

    // ----------------------------------------------------
    // TEST 10: Expired / Forged Token Rejection
    // ----------------------------------------------------
    const expiredToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString(), role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '-10s' } // Expired 10s ago
    );
    const expiredRes = await request(baseUrl, 'GET', '/api/auth/me', undefined, expiredToken);
    assert(
      expiredRes.status === 401 && expiredRes.data?.message?.includes('expired'),
      'Expired token rejected with 401 Unauthorized',
      JSON.stringify(expiredRes.data)
    );

    const forgedToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString(), role: 'admin' },
      'WRONG_SIGNING_SECRET'
    );
    const forgedRes = await request(baseUrl, 'GET', '/api/auth/me', undefined, forgedToken);
    assert(
      forgedRes.status === 401,
      'Forged/tampered JWT rejected with 401 Unauthorized',
      JSON.stringify(forgedRes.data)
    );

    // ----------------------------------------------------
    // TEST 11: Logout Endpoint
    // ----------------------------------------------------
    const logoutRes = await request(baseUrl, 'POST', '/api/auth/logout');
    assert(
      logoutRes.status === 200,
      'POST /api/auth/logout returns 200 OK',
      JSON.stringify(logoutRes.data)
    );

    // Clean up registered test user
    await User.deleteOne({ email: testUserEmail });
  } finally {
    server.close();
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  logger.info('====================================================');
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    logger.info(`🎉 ALL ${results.length} AUTHENTICATION & RBAC TESTS PASSED!`);
  } else {
    logger.error(`❌ ${results.filter((r) => !r.passed).length} of ${results.length} tests failed.`);
    process.exit(1);
  }
  logger.info('====================================================');
}

runAuthTestSuite().catch((err) => {
  logger.error('Auth test suite failed:', err);
  process.exit(1);
});
