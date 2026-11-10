import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Product name is required',
      })
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(200, 'Product name cannot exceed 200 characters')
      .optional()
      .or(z.string().min(2)),
    // Accept either name or title for backwards compatibility
    title: z.string().trim().min(2).optional(),
    glbUrl: z.string().url('Invalid GLB URL').optional(),
    usdzUrl: z.string().url('Invalid USDZ URL').optional().or(z.literal('')),
    status: z.enum(['draft', 'published']).optional().default('draft'),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(200, 'Product name cannot exceed 200 characters')
      .optional(),
    title: z.string().trim().min(2).optional(),
    glbUrl: z.string().url('Invalid GLB URL').optional(),
    usdzUrl: z.string().url('Invalid USDZ URL').optional().or(z.literal('')),
    status: z.enum(['draft', 'published']).optional(),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50),
    status: z.enum(['draft', 'published']).optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});
