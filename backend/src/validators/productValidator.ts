import { z } from 'zod';

const materialOptionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  hexColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  roughness: z.number().min(0).max(1).default(0.5),
  metalness: z.number().min(0).max(1).default(0.0),
  textureUrl: z.string().url().optional(),
  priceModifier: z.number().default(0),
});

const hardwareOptionSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  finish: z.string().min(1),
  price: z.number().min(0).default(0),
});

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z.string().min(2).optional(),
    sku: z.string().min(2),
    description: z.string().min(5),
    productType: z.enum(['door', 'window']),
    subType: z.string().min(1),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    basePrice: z.number().min(0),
    currency: z.string().default('USD'),
    dimensions: z.object({
      defaultWidth: z.number().positive(),
      defaultHeight: z.number().positive(),
      defaultDepth: z.number().positive(),
      unit: z.enum(['mm', 'inches']).default('mm'),
    }),
    customizable: z.object({
      widthRange: z.object({
        min: z.number().positive(),
        max: z.number().positive(),
      }),
      heightRange: z.object({
        min: z.number().positive(),
        max: z.number().positive(),
      }),
      materials: z.array(materialOptionSchema).default([]),
      hardware: z.array(hardwareOptionSchema).default([]),
    }),
    assets: z
      .object({
        primaryGlb: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        iosUsdz: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
        thumbnailUrl: z.string().default(''),
        galleryImages: z.array(z.string()).default([]),
      })
      .optional(),
    arConfig: z
      .object({
        enabled: z.boolean().default(true),
        placement: z.enum(['floor', 'wall', 'window']).default('wall'),
        scale: z.number().default(1.0),
        autoRotate: z.boolean().default(false),
      })
      .optional(),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    productType: z.enum(['door', 'window']).optional(),
    subType: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});
