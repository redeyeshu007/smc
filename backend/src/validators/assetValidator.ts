import { z } from 'zod';

export const uploadAssetMetadataSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Asset name is required'),
    format: z.enum(['glb', 'gltf', 'usdz', 'texture', 'hdr']),
    lodLevel: z.enum(['lod0', 'lod1', 'lod2']).optional().default('lod0'),
    polycount: z.coerce.number().optional(),
    hasAnimations: z.coerce.boolean().optional().default(false),
    isArReady: z.coerce.boolean().optional().default(false),
    dimensions: z
      .object({
        width: z.coerce.number(),
        height: z.coerce.number(),
        depth: z.coerce.number(),
        unit: z.enum(['meters', 'mm']).default('meters'),
      })
      .optional(),
  }),
});

export const getPresignedUrlSchema = z.object({
  body: z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    format: z.enum(['glb', 'gltf', 'usdz', 'texture', 'hdr']),
  }),
});
