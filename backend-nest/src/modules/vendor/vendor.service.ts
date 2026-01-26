import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { CursorPaginationDto } from '../../common/dto/pagination.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    private jwtService: JwtService,
  ) {}

  // تسجيل دخول التاجر
  async vendorLogin(email: string, password: string) {
    // البحث عن التاجر
    const vendor = await this.vendorModel.findOne({ email }).select('+password');

    if (!vendor) {
      throw new NotFoundException('Invalid credentials');
    }

    // التحقق من كلمة المرور
    const isValidPassword = await this.comparePassword(password, vendor.password);
    if (!isValidPassword) {
      throw new NotFoundException('Invalid credentials');
    }

    // التحقق من حالة التاجر (لا يوجد status field في Vendor entity)
    // TODO: Add status field to Vendor entity if needed
    // For now, assume all vendors are active

    // توليد token
    const token = await this.generateVendorToken(vendor);

    return {
      user: this.sanitizeVendor(vendor),
      token,
      type: 'vendor',
    };
  }

  // إنشاء تاجر جديد
  async create(createVendorDto: CreateVendorDto) {
    // التحقق من وجود التاجر
    const existing = await this.vendorModel.findOne({
      phone: createVendorDto.phone,
    });

    if (existing) {
      throw new ConflictException({
        code: 'VENDOR_EXISTS',
        message: 'Vendor already exists',
        userMessage: 'التاجر موجود مسبقاً',
        suggestedAction: 'يرجى استخدام رقم هاتف مختلف',
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(createVendorDto.password, 10);

    // إنشاء التاجر
    const vendor = await this.vendorModel.create({
      ...createVendorDto,
      password: hashedPassword,
      store: new Types.ObjectId(createVendorDto.store),
    });

    return this.sanitizeVendor(vendor);
  }

  // جلب كل التجار
  async findAll(pagination: CursorPaginationDto) {
    const query: Record<string, unknown> = {};

    if (pagination.cursor) {
      query._id = { $gt: new Types.ObjectId(pagination.cursor) };
    }

    const limit = pagination.limit || 20;
    const items = await this.vendorModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('store', 'name_ar name_en isActive');

    const hasMore = items.length > limit;
    const results = hasMore ? items.slice(0, -1) : items;

    return {
      data: results.map((v) => this.sanitizeVendor(v)),
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

  // جلب تاجر محدد
  async findOne(id: string) {
    const vendor = await this.vendorModel
      .findById(id)
      .populate('store', 'name_ar name_en isActive');

    if (!vendor) {
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        userMessage: 'التاجر غير موجود',
      });
    }

    return this.sanitizeVendor(vendor);
  }

  // تحديث بيانات التاجر
  async update(id: string, updateVendorDto: UpdateVendorDto) {
    const vendor = await this.vendorModel.findByIdAndUpdate(
      id,
      updateVendorDto,
      { new: true },
    );

    if (!vendor) {
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        userMessage: 'التاجر غير موجود',
      });
    }

    return this.sanitizeVendor(vendor);
  }

  // تحديث إحصائيات المبيعات
  async updateSalesStats(vendorId: string, revenue: number) {
    const vendor = await this.vendorModel.findByIdAndUpdate(
      vendorId,
      {
        $inc: {
          salesCount: 1,
          totalRevenue: revenue,
        },
      },
      { new: true },
    );

    if (!vendor) {
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        userMessage: 'التاجر غير موجود',
      });
    }

    return this.sanitizeVendor(vendor);
  }

  // إعادة تعيين كلمة المرور
  async resetPassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const vendor = await this.vendorModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true },
    );

    if (!vendor) {
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        message: 'Vendor not found',
        userMessage: 'التاجر غير موجود',
      });
    }

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  // لوحة معلومات التاجر (Dashboard)
  async getDashboard(vendorId: string) {
    const vendor = await this.vendorModel.findById(vendorId);
    if (!vendor) {
      throw new NotFoundException('التاجر غير موجود');
    }

    // Note: هذه بيانات بسيطة، يمكن ربطها بـ Order/Finance modules
    return {
      totalSales: vendor.totalRevenue || 0,
      totalOrders: vendor.salesCount || 0,
      averageOrderValue:
        vendor.salesCount > 0
          ? (vendor.totalRevenue || 0) / vendor.salesCount
          : 0,
      todaySales: 0, // يحتاج query على Order module
      todayOrders: 0, // يحتاج query على Order module
      pendingOrders: 0, // يحتاج query على Order module
    };
  }

  // كشف حساب التاجر
  async getAccountStatement(vendorId: string) {
    // Note: يحتاج ربط مع Finance module
    return {
      currentBalance: 0,
      totalEarnings: 0,
      totalWithdrawals: 0,
      pendingAmount: 0,
      transactions: [],
    };
  }

  // طلبات التسوية المالية
  async getSettlements(vendorId: string) {
    // Note: يحتاج ربط مع Finance module
    console.log(vendorId);
    return [];
  }

  // إنشاء طلب تسوية مالية
  async createSettlement(
    vendorId: string,
    body: { amount: number; bankAccount?: string },
  ) {
    // Note: يحتاج ربط مع Finance module
    return {
      _id: 'temp-' + Date.now(),
      amount: body.amount,
      status: 'pending',
      requestedDate: new Date(),
      vendorId,
      bankAccount: body.bankAccount,
    };
  }

  // سجل المبيعات
  async getSales(vendorId: string, limit?: number) {
    // Note: يحتاج ربط مع Order module
    console.log(vendorId, limit);
    return [];
  }

  // طلب حذف الحساب
  async requestAccountDeletion(
    vendorId: string,
    body: { reason?: string; exportData?: boolean },
  ) {
    const vendor = await this.vendorModel.findByIdAndUpdate(
      vendorId,
      {
        pendingDeletion: {
          requestedAt: new Date(),
          reason: body.reason,
          exportData: body.exportData,
        },
      },
      { new: true },
    );

    if (!vendor) {
      throw new NotFoundException('التاجر غير موجود');
    }

    return {
      message: 'تم استلام طلب حذف الحساب',
      scheduledDeletionDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    };
  }

  // توليد token للتاجر
  private async generateVendorToken(vendor: any) {
    const payload = {
      sub: vendor._id,
      email: vendor.email,
      role: 'vendor',
      type: 'vendor',
    };

    return this.jwtService.sign(payload);
  }

  // مقارنة كلمة المرور
  private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // إزالة كلمة المرور من الرد
  private sanitizeVendor(
    vendor: Vendor | (Vendor & { toObject?: () => Record<string, unknown> }),
  ): Record<string, unknown> {
    const vendorDoc = vendor as {
      toObject?: () => Record<string, unknown>;
    };
    const vendorObject = vendorDoc.toObject
      ? vendorDoc.toObject()
      : (vendor as unknown as Record<string, unknown>);
    const result = { ...vendorObject };
    delete result.password;
    return result;
  }
}
