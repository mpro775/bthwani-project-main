import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RewardHold, RewardHoldStatus } from './entities/reward-hold.entity';
import { WalletService } from '../wallet/wallet.service';
import { Maarouf } from './entities/maarouf.entity';

@Injectable()
export class RewardHoldService {
  constructor(
    @InjectModel(RewardHold.name)
    private readonly rewardHoldModel: Model<RewardHold>,
    @InjectModel(Maarouf.name)
    private readonly maaroufModel: Model<Maarouf>,
    private readonly walletService: WalletService,
  ) {}

  /**
   * إنشاء حجز مكافأة (Escrow) من صاحب الإعلان
   */
  async createHold(ownerId: string, maaroufId: string) {
    if (!Types.ObjectId.isValid(ownerId) || !Types.ObjectId.isValid(maaroufId)) {
      throw new BadRequestException('معرف غير صالح');
    }

    const maarouf = await this.maaroufModel
      .findById(maaroufId)
      .select('ownerId reward')
      .exec();

    if (!maarouf) {
      throw new NotFoundException('الإعلان غير موجود');
    }

    if (String(maarouf.ownerId) !== ownerId) {
      throw new BadRequestException('لا يمكنك حجز مكافأة لإعلان لا تملكه');
    }

    if (!maarouf.reward || maarouf.reward <= 0) {
      throw new BadRequestException('لا توجد مكافأة محددة لهذا الإعلان');
    }

    // حجز المبلغ في المحفظة باستخدام WalletService
    const tx = await this.walletService.holdFunds(
      ownerId,
      maarouf.reward,
      maaroufId,
      'maarouf_reward',
    );

    // توليد كود استلام (4 أرقام)
    const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

    const hold = new this.rewardHoldModel({
      founderId: new Types.ObjectId(ownerId),
      maaroufId: new Types.ObjectId(maaroufId),
      amount: maarouf.reward,
      status: RewardHoldStatus.PENDING,
      walletTxId: tx._id,
      deliveryCode,
    });

    return hold.save();
  }

  /**
   * تعيين المطالب بالمكافأة (claimer) قبل الإطلاق
   */
  async assignClaimer(holdId: string, claimerId: string) {
    if (!Types.ObjectId.isValid(holdId) || !Types.ObjectId.isValid(claimerId)) {
      throw new BadRequestException('معرف غير صالح');
    }

    const hold = await this.rewardHoldModel.findById(holdId).exec();
    if (!hold) {
      throw new NotFoundException('سجل حجز المكافأة غير موجود');
    }
    if (hold.status !== RewardHoldStatus.PENDING) {
      throw new BadRequestException('لا يمكن تعديل المطالب لمكافأة ليست قيد الانتظار');
    }

    hold.claimerId = new Types.ObjectId(claimerId);
    return hold.save();
  }

  /**
   * إطلاق المكافأة من المؤسس إلى المطالب (بعد تأكيد التسليم مثلاً)
   */
  async releaseHold(holdId: string) {
    if (!Types.ObjectId.isValid(holdId)) {
      throw new BadRequestException('معرف غير صالح');
    }

    const hold = await this.rewardHoldModel.findById(holdId).exec();
    if (!hold) {
      throw new NotFoundException('سجل حجز المكافأة غير موجود');
    }
    if (hold.status !== RewardHoldStatus.PENDING) {
      throw new BadRequestException('تمت معالجة هذا الحجز مسبقاً');
    }
    if (!hold.claimerId) {
      throw new BadRequestException('لا يوجد مستلم محدد للمكافأة');
    }

    await this.walletService.completeEscrowTransfer(
      String(hold.founderId),
      String(hold.claimerId),
      hold.amount,
      String(hold.maaroufId),
      'maarouf_reward',
    );

    hold.status = RewardHoldStatus.RELEASED;
    return hold.save();
  }

  /**
   * استرداد المبلغ المحجوز إلى المؤسس (إلغاء المكافأة)
   */
  async refundHold(holdId: string) {
    if (!Types.ObjectId.isValid(holdId)) {
      throw new BadRequestException('معرف غير صالح');
    }

    const hold = await this.rewardHoldModel.findById(holdId).exec();
    if (!hold) {
      throw new NotFoundException('سجل حجز المكافأة غير موجود');
    }
    if (hold.status !== RewardHoldStatus.PENDING) {
      throw new BadRequestException('تمت معالجة هذا الحجز مسبقاً');
    }

    await this.walletService.refundHeldFunds(
      String(hold.founderId),
      hold.amount,
      String(hold.maaroufId),
      'maarouf_reward_refund',
    );

    hold.status = RewardHoldStatus.REFUNDED;
    return hold.save();
  }

  /**
   * التحقق من كود الاستلام وإطلاق المكافأة في خطوة واحدة
   */
  async verifyCodeAndRelease(holdId: string, code: string) {
    if (!Types.ObjectId.isValid(holdId)) {
      throw new BadRequestException('معرف غير صالح');
    }

    const hold = await this.rewardHoldModel.findById(holdId).exec();
    if (!hold) {
      throw new NotFoundException('سجل حجز المكافأة غير موجود');
    }
    if (hold.status !== RewardHoldStatus.PENDING) {
      throw new BadRequestException('تمت معالجة هذا الحجز مسبقاً');
    }
    if (!hold.claimerId) {
      throw new BadRequestException('لا يوجد مستلم محدد للمكافأة');
    }
    if (!hold.deliveryCode || hold.deliveryCode !== code) {
      throw new BadRequestException('رمز الاستلام غير صحيح');
    }

    await this.walletService.completeEscrowTransfer(
      String(hold.founderId),
      String(hold.claimerId),
      hold.amount,
      String(hold.maaroufId),
      'maarouf_reward',
    );

    hold.status = RewardHoldStatus.RELEASED;
    return hold.save();
  }

  async listByMaarouf(maaroufId: string) {
    if (!Types.ObjectId.isValid(maaroufId)) {
      throw new BadRequestException('معرف غير صالح');
    }

    return this.rewardHoldModel
      .find({ maaroufId: new Types.ObjectId(maaroufId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}

