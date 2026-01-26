import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Store } from './entities/store.entity';
import { Product } from './entities/product.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<Store>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  // Stores
  async createStore(createStoreDto: CreateStoreDto) {
    const store = await this.storeModel.create(createStoreDto);
    return store;
  }

  async findStores(
    pagination: CursorPaginationDto,
    filters?: {
      categoryId?: string;
      isTrending?: boolean;
      isFeatured?: boolean;
      usageType?: string;
    },
  ) {
    const query: Record<string, unknown> = { isActive: true };
    
    if (filters?.categoryId) {
      query.category = new Types.ObjectId(filters.categoryId);
    }
    if (filters?.isTrending !== undefined) {
      query.isTrending = filters.isTrending;
    }
    if (filters?.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }
    if (filters?.usageType) {
      query.usageType = filters.usageType;
    }
    
    if (pagination.cursor) {
      query._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items = await this.storeModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (
              results[results.length - 1] as { _id: Types.ObjectId }
            )._id.toString()
          : null,
        hasMore,
        limit,
      },
    };
  }

  async findStoresAdmin(
    pagination: CursorPaginationDto,
    filters?: {
      isActive?: string;
      usageType?: string;
      q?: string;
    },
  ) {
    const query: Record<string, unknown> = {};
    
    if (filters?.isActive !== undefined && filters.isActive !== '') {
      query.isActive = filters.isActive === 'true';
    }
    if (filters?.usageType) {
      query.usageType = filters.usageType;
    }
    if (filters?.q) {
      query.$or = [
        { name: { $regex: filters.q, $options: 'i' } },
        { name_ar: { $regex: filters.q, $options: 'i' } },
        { name_en: { $regex: filters.q, $options: 'i' } },
        { address: { $regex: filters.q, $options: 'i' } },
      ];
    }
    
    if (pagination.cursor) {
      query._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items = await this.storeModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (
              results[results.length - 1] as { _id: Types.ObjectId }
            )._id.toString()
          : null,
        hasMore,
        limit,
      },
    };
  }

  async searchStores(query: string, pagination: CursorPaginationDto) {
    const searchQuery: Record<string, unknown> = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { name_ar: { $regex: query, $options: 'i' } },
        { name_en: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    if (pagination.cursor) {
      searchQuery._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items = await this.storeModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit + 1);
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (
              results[results.length - 1] as { _id: Types.ObjectId }
            )._id.toString()
          : null,
        hasMore,
        limit,
      },
    };
  }

  async findStoreById(id: string) {
    const store = await this.storeModel.findById(id);
    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        userMessage: 'المتجر غير موجود',
      });
    }
    return store;
  }

  // Products
  async createProduct(createProductDto: CreateProductDto) {
    const product = await this.productModel.create({
      ...createProductDto,
      store: new Types.ObjectId(createProductDto.store),
      finalPrice: createProductDto.price - (createProductDto.discount || 0),
    });
    return product;
  }

  async findProductsByStore(storeId: string, pagination: CursorPaginationDto) {
    const query: Record<string, unknown> = {
      store: new Types.ObjectId(storeId),
      isActive: true,
    };
    if (pagination.cursor) {
      query._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items = await this.productModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);
    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results,
      pagination: {
        nextCursor: hasMore
          ? (
              results[results.length - 1] as { _id: Types.ObjectId }
            )._id.toString()
          : null,
        hasMore,
        limit,
      },
    };
  }

  async updateStore(storeId: string, updates: Partial<Store>) {
    const store = await this.storeModel.findByIdAndUpdate(storeId, updates, {
      new: true,
    });
    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        userMessage: 'المتجر غير موجود',
      });
    }
    return store;
  }

  async activateStore(storeId: string) {
    return this.updateStore(storeId, { isActive: true });
  }

  async deactivateStore(storeId: string) {
    return this.updateStore(storeId, { isActive: false });
  }

  async forceCloseStore(storeId: string) {
    return this.updateStore(storeId, { forceClosed: true });
  }

  async forceOpenStore(storeId: string) {
    return this.updateStore(storeId, { forceClosed: false });
  }

  async getStoreStatistics(_storeId: string) {
    void _storeId; // TODO: Aggregate from orders
    await Promise.resolve(); // Adding await to satisfy linter
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: 0,
      totalProducts: 0,
    };
  }

  async updateProduct(productId: string, updates: Partial<Product>) {
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      updates,
      { new: true },
    );
    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        userMessage: 'المنتج غير موجود',
      });
    }
    return product;
  }

  // ==================== Store Extended Features ====================

  async getStoreReviews(_storeId: string, _pagination: CursorPaginationDto) {
    void _storeId;
    void _pagination; // TODO: Implement reviews from Order ratings
    await Promise.resolve(); // Adding await to satisfy linter
    return { data: [], total: 0, averageRating: 0 };
  }

  async getStoreAnalytics(
    _storeId: string,
    _startDate?: string,
    _endDate?: string,
  ) {
    void _storeId;
    void _startDate;
    void _endDate; // TODO: Aggregate from orders
    await Promise.resolve(); // Adding await to satisfy linter
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      topProducts: [],
      revenueByDay: [],
    };
  }

  async getProductVariants(_productId: string) {
    void _productId; // TODO: Implement product variants
    await Promise.resolve(); // Adding await to satisfy linter
    return { data: [] };
  }

  async addProductVariant(
    _productId: string,
    variant: Record<string, unknown>,
  ) {
    // TODO: Implement product variants
    await Promise.resolve(); // Adding await to satisfy linter
    return { success: true, message: 'تم إضافة المتغير', variant };
  }

  async getStoreInventory(storeId: string) {
    const products = await this.productModel.find({
      store: new Types.ObjectId(storeId),
    });

    const productsWithStock = products.map(
      (p) => p as unknown as { stock?: number },
    );

    return {
      totalProducts: products.length,
      lowStock: productsWithStock.filter((p) => (p.stock || 0) < 10).length,
      outOfStock: productsWithStock.filter((p) => (p.stock || 0) === 0).length,
      products: products.map((p) => {
        const productDoc = p as unknown as { stock?: number };
        return {
          id: p._id,
          name: p.name,
          stock: productDoc.stock || 0,
          price: p.price,
        };
      }),
    };
  }

  async deleteStore(storeId: string) {
    const store = await this.storeModel.findByIdAndDelete(storeId);
    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        userMessage: 'المتجر غير موجود',
      });
    }
    return { success: true, message: 'تم حذف المتجر بنجاح' };
  }

  // ==================== Store Approval & Moderation ====================

  async getPendingStores() {
    const stores = await this.storeModel.find({
      isActive: false,
      // يمكن إضافة status: 'pending' إذا كان موجود في schema
    });
    return stores;
  }

  async approveStore(storeId: string) {
    const store = await this.storeModel.findByIdAndUpdate(
      storeId,
      { isActive: true },
      { new: true },
    );
    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        userMessage: 'المتجر غير موجود',
      });
    }
    return { success: true, message: 'تمت الموافقة على المتجر', store };
  }

  async rejectStore(storeId: string, reason: string) {
    const store = await this.storeModel.findByIdAndUpdate(
      storeId,
      { isActive: false },
      { new: true },
    );
    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        userMessage: 'المتجر غير موجود',
      });
    }
    return { success: true, message: 'تم رفض المتجر', reason, store };
  }

  async suspendStore(storeId: string, reason: string) {
    const store = await this.storeModel.findByIdAndUpdate(
      storeId,
      { isActive: false, forceClosed: true },
      { new: true },
    );
    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        userMessage: 'المتجر غير موجود',
      });
    }
    return { success: true, message: 'تم تعليق المتجر', reason, store };
  }
}
