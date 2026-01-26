import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant } from '../entities/merchant.entity';
import { MerchantProduct } from '../entities/merchant-product.entity';
import { ProductCatalog } from '../entities/product-catalog.entity';
import { MerchantCategory } from '../entities/merchant-category.entity';
import { Attribute } from '../entities/attribute.entity';
import {
  CreateMerchantDto,
  UpdateMerchantDto,
} from '../dto/create-merchant.dto';
import {
  CreateMerchantProductDto,
  UpdateMerchantProductDto,
} from '../dto/create-merchant-product.dto';
import {
  CreateProductCatalogDto,
  UpdateProductCatalogDto,
} from '../dto/create-product-catalog.dto';
import {
  CreateMerchantCategoryDto,
  UpdateMerchantCategoryDto,
} from '../dto/create-category.dto';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
} from '../dto/create-attribute.dto';

@Injectable()
export class MerchantService {
  constructor(
    @InjectModel(Merchant.name)
    private merchantModel: Model<Merchant>,
    @InjectModel(MerchantProduct.name)
    private merchantProductModel: Model<MerchantProduct>,
    @InjectModel(ProductCatalog.name)
    private productCatalogModel: Model<ProductCatalog>,
    @InjectModel(MerchantCategory.name)
    private categoryModel: Model<MerchantCategory>,
    @InjectModel(Attribute.name)
    private attributeModel: Model<Attribute>,
  ) {}

  // ==================== Merchant Management ====================

  async createMerchant(dto: CreateMerchantDto): Promise<Merchant> {
    const existing = await this.merchantModel.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('التاجر موجود بالفعل');
    }

    const merchant = new this.merchantModel(dto);
    return merchant.save();
  }

  async findAllMerchants(isActive?: boolean): Promise<any[]> {
    const query: Record<string, any> = {};
    if (isActive !== undefined) query.isActive = isActive;

    return this.merchantModel.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  async findMerchantById(id: string): Promise<Merchant> {
    const merchant = await this.merchantModel.findById(id);
    if (!merchant) {
      throw new NotFoundException('التاجر غير موجود');
    }
    return merchant;
  }

  async updateMerchant(id: string, dto: UpdateMerchantDto): Promise<Merchant> {
    const merchant = await this.merchantModel.findById(id);
    if (!merchant) {
      throw new NotFoundException('التاجر غير موجود');
    }

    Object.assign(merchant, dto);
    return merchant.save();
  }

  async deleteMerchant(id: string): Promise<void> {
    const result = await this.merchantModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('التاجر غير موجود');
    }
  }

  // ==================== Product Catalog Management ====================

  async createProductCatalog(
    dto: CreateProductCatalogDto,
  ): Promise<ProductCatalog> {
    const catalog = new this.productCatalogModel(dto);
    return catalog.save();
  }

  async findAllProductCatalogs(usageType?: string): Promise<any[]> {
    const query: Record<string, any> = { isActive: true };
    if (usageType) query.usageType = usageType;

    return this.productCatalogModel
      .find(query)
      .populate('category')
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async findProductCatalogById(id: string): Promise<ProductCatalog> {
    const catalog = await this.productCatalogModel
      .findById(id)
      .populate('category');
    if (!catalog) {
      throw new NotFoundException('المنتج غير موجود في الكتالوج');
    }
    return catalog;
  }

  async updateProductCatalog(
    id: string,
    dto: UpdateProductCatalogDto,
  ): Promise<ProductCatalog> {
    const catalog = await this.productCatalogModel.findById(id);
    if (!catalog) {
      throw new NotFoundException('المنتج غير موجود');
    }

    Object.assign(catalog, dto);
    return catalog.save();
  }

  // ==================== Merchant Product Management ====================

  async createMerchantProduct(
    dto: CreateMerchantProductDto,
  ): Promise<MerchantProduct> {
    // التحقق من وجود المنتج في الكتالوج
    const catalogProduct = await this.productCatalogModel.findById(dto.product);
    if (!catalogProduct) {
      throw new NotFoundException('المنتج غير موجود في الكتالوج');
    }

    const merchantProduct = new this.merchantProductModel(dto);
    return merchantProduct.save();
  }

  async findMerchantProducts(
    merchantId: string,
    storeId?: string,
    isAvailable?: boolean,
  ): Promise<any[]> {
    const query: Record<string, any> = { merchant: merchantId };
    if (storeId) query.store = storeId;
    if (isAvailable !== undefined) query.isAvailable = isAvailable;

    return this.merchantProductModel
      .find(query)
      .populate('product merchant store')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findStoreProducts(storeId: string, sectionId?: string): Promise<any[]> {
    const query: Record<string, any> = { store: storeId, isAvailable: true };
    if (sectionId) query.section = sectionId;

    return this.merchantProductModel
      .find(query)
      .populate('product')
      .sort({ soldCount: -1, rating: -1 })
      .lean()
      .exec();
  }

  async updateMerchantProduct(
    id: string,
    dto: UpdateMerchantProductDto,
  ): Promise<MerchantProduct> {
    const product = await this.merchantProductModel.findById(id);
    if (!product) {
      throw new NotFoundException('المنتج غير موجود');
    }

    Object.assign(product, dto);
    return product.save();
  }

  async updateStock(id: string, quantity: number): Promise<MerchantProduct> {
    const product = await this.merchantProductModel.findById(id);
    if (!product) {
      throw new NotFoundException('المنتج غير موجود');
    }

    product.stock = (product.stock || 0) + quantity;
    if (product.stock < 0) product.stock = 0;

    return product.save();
  }

  async recordSale(id: string): Promise<void> {
    await this.merchantProductModel.findByIdAndUpdate(id, {
      $inc: { soldCount: 1 },
      lastSoldAt: new Date(),
    });
  }

  async findMerchantProductById(id: string): Promise<MerchantProduct> {
    const product = await this.merchantProductModel
      .findById(id)
      .populate('merchant')
      .populate('store')
      .populate('product')
      .exec();

    if (!product) {
      throw new NotFoundException('المنتج غير موجود');
    }

    return product;
  }

  async deleteMerchantProduct(id: string): Promise<void> {
    const result = await this.merchantProductModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('المنتج غير موجود');
    }
  }

  async findAllMerchantProducts(filters: {
    merchantId?: string;
    storeId?: string;
    isAvailable?: boolean;
  }): Promise<any[]> {
    const query: Record<string, any> = {};

    if (filters.merchantId) query.merchant = filters.merchantId;
    if (filters.storeId) query.store = filters.storeId;
    if (filters.isAvailable !== undefined) query.isAvailable = filters.isAvailable;

    return this.merchantProductModel
      .find(query)
      .populate('merchant')
      .populate('store')
      .populate('product')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // ==================== Category Management ====================

  async createCategory(
    dto: CreateMerchantCategoryDto,
  ): Promise<MerchantCategory> {
    let level = 0;
    if (dto.parent) {
      const parent = await this.categoryModel.findById(dto.parent);
      if (parent) {
        level = (parent.level || 0) + 1;
      }
    }

    const category = new this.categoryModel({
      ...dto,
      level,
      productsCount: 0,
    });
    return category.save();
  }

  async findAllCategories(parent?: string): Promise<any[]> {
    const query: Record<string, any> = { isActive: true };
    if (parent) {
      query.parent = parent;
    } else {
      query.parent = null; // الفئات الجذر فقط
    }

    return this.categoryModel
      .find(query)
      .sort({ level: 1, order: 1 })
      .lean()
      .exec();
  }

  async updateCategory(
    id: string,
    dto: UpdateMerchantCategoryDto,
  ): Promise<MerchantCategory> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('الفئة غير موجودة');
    }

    Object.assign(category, dto);
    return category.save();
  }

  // ==================== Attribute Management ====================

  async createAttribute(dto: CreateAttributeDto): Promise<Attribute> {
    const existing = await this.attributeModel.findOne({ name: dto.name });
    if (existing) {
      throw new BadRequestException('الخاصية موجودة بالفعل');
    }

    const attribute = new this.attributeModel(dto);
    return attribute.save();
  }

  async findAllAttributes(): Promise<any[]> {
    return this.attributeModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .lean()
      .exec();
  }

  async updateAttribute(
    id: string,
    dto: UpdateAttributeDto,
  ): Promise<Attribute> {
    const attribute = await this.attributeModel.findById(id);
    if (!attribute) {
      throw new NotFoundException('الخاصية غير موجودة');
    }

    Object.assign(attribute, dto);
    return attribute.save();
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('الفئة غير موجودة');
    }

    // التحقق من عدم وجود منتجات مرتبطة بهذه الفئة
    const productsCount = await this.merchantProductModel.countDocuments({
      category: id,
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'لا يمكن حذف الفئة لأن هناك منتجات مرتبطة بها',
      );
    }

    await this.categoryModel.findByIdAndDelete(id);
  }

  async deleteAttribute(id: string): Promise<void> {
    const attribute = await this.attributeModel.findById(id);
    if (!attribute) {
      throw new NotFoundException('الخاصية غير موجودة');
    }

    await this.attributeModel.findByIdAndDelete(id);
  }
}
