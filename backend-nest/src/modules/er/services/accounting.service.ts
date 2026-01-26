import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';
import { ChartOfAccounts } from '../entities/chart-of-accounts.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { CreateChartAccountDto } from '../dto/create-chart-account.dto';
import { CreateJournalEntryDto } from '../dto/create-journal-entry.dto';

@Injectable()
export class AccountingService {
  constructor(
    @InjectModel(ChartOfAccounts.name)
    private chartModel: Model<ChartOfAccounts>,
    @InjectModel(JournalEntry.name)
    private journalModel: Model<JournalEntry>,
  ) {}

  // ==================== Chart of Accounts ====================

  async createAccount(dto: CreateChartAccountDto): Promise<ChartOfAccounts> {
    const existing = await this.chartModel.findOne({
      accountCode: dto.accountCode,
    });

    if (existing) {
      throw new BadRequestException('رمز الحساب مستخدم بالفعل');
    }

    let level = 0;
    if (dto.parent) {
      const parent = await this.chartModel.findById(dto.parent);
      if (parent) level = (parent.level || 0) + 1;
    }

    const account = new this.chartModel({
      ...dto,
      level,
      currentBalance: 0,
    });

    return account.save();
  }

  async findAllAccounts(accountType?: string): Promise<any[]> {
    const query: {
      isActive: boolean;
      accountType?: string;
    } = { isActive: true };
    if (accountType) query.accountType = accountType;

    return this.chartModel
      .find(query)
      .populate('parent')
      .sort({ accountCode: 1 })
      .lean()
      .exec();
  }

  async findAccountById(id: string): Promise<ChartOfAccounts> {
    const account = await this.chartModel.findById(id).populate('parent');
    if (!account) {
      throw new NotFoundException('الحساب غير موجود');
    }
    return account;
  }

  // ==================== Journal Entries ====================

  async createJournalEntry(
    dto: CreateJournalEntryDto,
    createdBy: string,
  ): Promise<JournalEntry> {
    const entryNumber = await this.generateEntryNumber();

    // التحقق من توازن القيد
    const totalDebit = dto.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = dto.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        'القيد غير متوازن - المدين والدائن يجب أن يتساويا',
      );
    }

    const entry = new this.journalModel({
      ...dto,
      entryNumber,
      date: new Date(dto.date),
      totalDebit,
      totalCredit,
      createdBy,
      status: 'draft',
    });

    return entry.save();
  }

  private async generateEntryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.journalModel.countDocuments({
      entryNumber: new RegExp(`^JE-${year}${month}`),
    });
    return `JE-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  async postJournalEntry(id: string, postedBy: string): Promise<JournalEntry> {
    const entry = await this.journalModel.findById(id);
    if (!entry) {
      throw new NotFoundException('القيد غير موجود');
    }

    if (entry.status !== 'draft') {
      throw new BadRequestException('القيد تم ترحيله بالفعل');
    }

    // تحديث أرصدة الحسابات
    for (const line of entry.lines) {
      const account = await this.chartModel.findById(line.account);
      if (account) {
        if (account.normalBalance === 'debit') {
          account.currentBalance += line.debit - line.credit;
        } else {
          account.currentBalance += line.credit - line.debit;
        }
        await account.save();
      }
    }

    entry.status = 'posted';
    entry.postedBy = postedBy as unknown as Types.ObjectId;
    entry.postedAt = new Date();

    return entry.save();
  }

  async findJournalEntries(
    type?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const query: {
      type?: string;
      status?: string;
      date?: { $gte?: Date; $lte?: Date };
    } = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    return this.journalModel
      .find(query)
      .sort({ date: -1 })
      .populate('createdBy postedBy')
      .lean()
      .exec();
  }

  // ==================== Reports ====================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTrialBalance(_date: Date = new Date()): Promise<any[]> {
    const accounts = await this.chartModel
      .find({ isActive: true })
      .sort({ accountCode: 1 })
      .lean()
      .exec();

    return accounts.map((account: FlattenMaps<ChartOfAccounts>) => ({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      debit:
        account.normalBalance === 'debit' && account.currentBalance > 0
          ? account.currentBalance
          : 0,
      credit:
        account.normalBalance === 'credit' && account.currentBalance > 0
          ? account.currentBalance
          : 0,
    }));
  }
}
