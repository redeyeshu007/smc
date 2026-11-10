import { Product, IProduct } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { FilterQuery } from 'mongoose';

export class ProductService {
  /**
   * Create a new product
   */
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const slug =
      data.slug ||
      data.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const existing = await Product.findOne({
      $or: [{ slug }, { sku: data.sku }],
    });

    if (existing) {
      throw ApiError.conflict('Product with this slug or SKU already exists');
    }

    const product = await Product.create({ ...data, slug });
    return product;
  }

  /**
   * Find product by ID with populated 3D assets
   */
  async getProductById(id: string): Promise<IProduct> {
    const product = await Product.findById(id)
      .populate('category')
      .populate('assets.primaryGlb')
      .populate('assets.iosUsdz');

    if (!product) {
      throw ApiError.notFound(`Product with ID '${id}' not found`);
    }

    return product;
  }

  /**
   * Find product by Slug with populated 3D assets
   */
  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await Product.findOne({ slug })
      .populate('category')
      .populate('assets.primaryGlb')
      .populate('assets.iosUsdz');

    if (!product) {
      throw ApiError.notFound(`Product with slug '${slug}' not found`);
    }

    return product;
  }

  /**
   * Query products with pagination & filtering
   */
  async queryProducts(params: {
    page: number;
    limit: number;
    productType?: 'door' | 'window';
    subType?: string;
    status?: string;
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<{ products: IProduct[]; total: number; pages: number }> {
    const {
      page = 1,
      limit = 20,
      productType,
      subType,
      status,
      category,
      search,
      sort = '-createdAt',
    } = params;

    const filter: FilterQuery<IProduct> = {};

    if (productType) filter.productType = productType;
    if (subType) filter.subType = subType;
    if (status) filter.status = status;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug type')
        .populate('assets.primaryGlb', 'url format fileSize lodLevel isArReady isVrReady')
        .populate('assets.iosUsdz', 'url format fileSize')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update product by ID
   */
  async updateProduct(id: string, updateData: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category')
      .populate('assets.primaryGlb')
      .populate('assets.iosUsdz');

    if (!product) {
      throw ApiError.notFound(`Product with ID '${id}' not found`);
    }

    return product;
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(id: string): Promise<void> {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw ApiError.notFound(`Product with ID '${id}' not found`);
    }
  }
}

export const productService = new ProductService();
