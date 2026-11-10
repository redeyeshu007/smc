import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { logger } from './logger.js';

export async function seedAdminAccount(): Promise<void> {
  const adminEmail = env.ADMIN_EMAIL.toLowerCase().trim();
  const adminName = env.ADMIN_NAME.trim();
  const adminPassword = env.ADMIN_PASSWORD;

  logger.info(`Checking initial admin account (${adminEmail})...`);

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      logger.info(`Promoted existing user ${adminEmail} to admin role.`);
    } else {
      logger.info(`Initial admin account ${adminEmail} is already initialized.`);
    }
    return;
  }

  // Hash password using bcrypt (12 rounds)
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const admin = await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: 'admin',
  });

  logger.info('====================================================');
  logger.info('✅ Initial Admin Account Initialized Successfully:');
  logger.info(`   ID   : ${admin._id}`);
  logger.info(`   Name : ${admin.name}`);
  logger.info(`   Email: ${admin.email}`);
  logger.info(`   Role : ${admin.role}`);
  logger.info('   Note : Password securely hashed with bcrypt.');
  logger.info('====================================================');
}

// Standalone execution support
if (process.argv[1] && process.argv[1].includes('seed-admin')) {
  (async () => {
    try {
      await db.connect();
      await seedAdminAccount();
    } catch (err) {
      logger.error('Failed to seed admin account:', err);
      process.exit(1);
    } finally {
      await db.disconnect();
      process.exit(0);
    }
  })();
}
