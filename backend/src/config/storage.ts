import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

let s3ClientInstance: S3Client | null = null;

export const getS3Client = (): S3Client | null => {
  if (env.STORAGE_PROVIDER === 'local') {
    return null;
  }

  if (!s3ClientInstance) {
    if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
      logger.warn(
        'S3 credentials not fully configured. Falling back to local storage.'
      );
      return null;
    }

    s3ClientInstance = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: env.STORAGE_PROVIDER === 'r2', // Cloudflare R2 requires path style
    });

    logger.info(`Initialized ${env.STORAGE_PROVIDER.toUpperCase()} storage client`);
  }

  return s3ClientInstance;
};

// Ensure local uploads directory exists
export const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}
