import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),

  // Database
  MONGODB_URI: z
    .string()
    .default('mongodb://localhost:27017/smc_showroom'),
  MONGODB_DB_NAME: z.string().default('smc_showroom'),

  // JWT
  JWT_SECRET: z.string().min(16).default('smc_development_jwt_secret_key_32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Storage (Cloudflare R2 / AWS S3 / Local fallback)
  STORAGE_PROVIDER: z.enum(['s3', 'r2', 'local']).default('local'),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('auto'),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().default('smc-3d-assets'),
  S3_PUBLIC_DOMAIN: z.string().default('http://localhost:5000/uploads'),

  // Upload limits
  MAX_FILE_SIZE_MB: z.coerce.number().default(50),
  MAX_IMAGE_SIZE_MB: z.coerce.number().default(10),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment configuration');
  }
  return parsed.data;
};

export const env = parseEnv();
export type Environment = z.infer<typeof envSchema>;
