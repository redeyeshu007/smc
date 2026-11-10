import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { getS3Client, LOCAL_UPLOADS_DIR } from '../config/storage.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/apiError.js';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
}

export class StorageService {
  /**
   * Generates a unique key for the asset
   */
  private generateKey(originalName: string, folder = 'models'): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(8).toString('hex');
    const sanitizedName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    return `${folder}/${Date.now()}-${sanitizedName}-${hash}${ext}`;
  }

  /**
   * Uploads a buffer to S3 / Cloudflare R2 or local disk
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = 'models'
  ): Promise<UploadResult> {
    const key = this.generateKey(originalName, folder);
    const s3Client = getS3Client();

    if (s3Client && env.STORAGE_PROVIDER !== 'local') {
      try {
        const command = new PutObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        });

        await s3Client.send(command);

        const url = `${env.S3_PUBLIC_DOMAIN.replace(/\/$/, '')}/${key}`;
        logger.info(`File uploaded to S3/R2: ${key}`);

        return {
          url,
          key,
          bucket: env.S3_BUCKET_NAME,
          size: buffer.length,
          mimeType,
        };
      } catch (err) {
        logger.error('S3/R2 upload failed:', err);
        throw ApiError.internal('Failed to upload file to cloud storage');
      }
    } else {
      // Local storage fallback
      const localFilePath = path.join(LOCAL_UPLOADS_DIR, key);
      await fs.mkdir(path.dirname(localFilePath), { recursive: true });
      await fs.writeFile(localFilePath, buffer);

      const url = `${env.S3_PUBLIC_DOMAIN.replace(/\/$/, '')}/${key}`;
      logger.info(`File saved locally: ${localFilePath}`);

      return {
        url,
        key,
        bucket: 'local',
        size: buffer.length,
        mimeType,
      };
    }
  }

  /**
   * Optimizes an image (generates WebP thumbnail and optimized full view)
   */
  async processAndUploadImage(
    buffer: Buffer,
    originalName: string,
    maxWidth = 1920
  ): Promise<{ full: UploadResult; thumbnail: UploadResult }> {
    try {
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const thumbnailBuffer = await sharp(buffer)
        .resize({ width: 400, height: 400, fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      const baseName = path.basename(originalName, path.extname(originalName));

      const full = await this.uploadFile(
        optimizedBuffer,
        `${baseName}.webp`,
        'image/webp',
        'images'
      );

      const thumbnail = await this.uploadFile(
        thumbnailBuffer,
        `${baseName}-thumb.webp`,
        'image/webp',
        'thumbnails'
      );

      return { full, thumbnail };
    } catch (err) {
      logger.error('Sharp image processing error:', err);
      throw ApiError.internal('Failed to optimize and upload image');
    }
  }

  /**
   * Generates a presigned upload URL for direct client upload (S3 / Cloudflare R2)
   */
  async getPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder = 'models'
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const s3Client = getS3Client();
    const key = this.generateKey(fileName, folder);

    if (s3Client && env.STORAGE_PROVIDER !== 'local') {
      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        ContentType: mimeType,
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      const publicUrl = `${env.S3_PUBLIC_DOMAIN.replace(/\/$/, '')}/${key}`;

      return { uploadUrl, key, publicUrl };
    }

    // For local fallback: direct backend upload route is used
    return {
      uploadUrl: `${env.S3_PUBLIC_DOMAIN}/direct-upload`,
      key,
      publicUrl: `${env.S3_PUBLIC_DOMAIN.replace(/\/$/, '')}/${key}`,
    };
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    const s3Client = getS3Client();
    if (s3Client && env.STORAGE_PROVIDER !== 'local') {
      const command = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
      });
      await s3Client.send(command);
    } else {
      const localFilePath = path.join(LOCAL_UPLOADS_DIR, key);
      await fs.unlink(localFilePath).catch(() => {});
    }
  }
}

export const storageService = new StorageService();
