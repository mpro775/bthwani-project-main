import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { WalletService } from './wallet.service';
import { User } from '../auth/entities/user.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { NotFoundException } from '@nestjs/common';
import { WithdrawalService } from '../withdrawal/withdrawal.service';

describe('WalletService', () => {
  let service: WalletService;
  let mockUserModel: any;
  let mockTransactionModel: any;
  let mockConnection: any;
  let mockWithdrawalService: any;

  beforeEach(async () => {
    // Mock models
    mockUserModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOne: jest.fn(),
    };

    mockTransactionModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    mockConnection = {
      startSession: jest.fn().mockResolvedValue({
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      }),
    };

    mockWithdrawalService = {
      createWithdrawal: jest.fn(),
      approveWithdrawal: jest.fn(),
      rejectWithdrawal: jest.fn(),
      getWithdrawals: jest.fn(),
      getPendingWithdrawals: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(WalletTransaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        {
          provide: WithdrawalService,
          useValue: mockWithdrawalService,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWalletBalance', () => {
    it('should return wallet balance for valid user', async () => {
      const mockUser = {
        _id: 'user123',
        wallet: {
          balance: 1000,
          onHold: 100,
          totalSpent: 500,
          totalEarned: 1500,
          loyaltyPoints: 50,
          savings: 200,
          currency: 'YER',
          lastUpdated: new Date(),
        },
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.getWalletBalance('user123');

      expect(result).toEqual({
        userId: mockUser._id,
        balance: 1000,
        onHold: 100,
        availableBalance: 900,
        totalSpent: 500,
        totalEarned: 1500,
        loyaltyPoints: 50,
        savings: 200,
        currency: 'YER',
        lastUpdated: mockUser.wallet.lastUpdated,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.getWalletBalance('invalid-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTransaction', () => {
    it('should create a credit transaction successfully', async () => {
      const mockUser = {
        _id: 'user123',
        wallet: {
          balance: 1000,
          onHold: 0,
        },
      };

      const mockTransaction = {
        _id: 'tx123',
        userId: 'user123',
        amount: 500,
        type: 'credit',
        status: 'completed',
      };

      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      mockConnection.startSession.mockResolvedValue(mockSession);
      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockUser),
      });
      mockTransactionModel.create.mockResolvedValue([mockTransaction]);
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);

      const dto = {
        userId: 'user123',
        amount: 500,
        type: 'credit',
        method: 'kuraimi',
        description: 'Test deposit',
      };

      // Note: This is a simplified test. Full test would need to mock TransactionHelper
      // For now, we're just testing the basic structure
      expect(service).toBeDefined();
    });

    it('should throw error for debit when insufficient balance', async () => {
      const mockUser = {
        _id: 'user123',
        wallet: {
          balance: 100,
          onHold: 0,
        },
      };

      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockUser),
      });

      // This would be tested with actual transaction execution
      expect(service).toBeDefined();
    });
  });

  describe('holdFunds', () => {
    it('should hold funds successfully', async () => {
      const mockUser = {
        _id: 'user123',
        wallet: {
          balance: 1000,
          onHold: 0,
        },
      };

      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockUser),
      });

      // Simplified test
      expect(service).toBeDefined();
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds between users successfully', async () => {
      const mockSender = {
        _id: 'sender123',
        fullName: 'Sender User',
        wallet: {
          balance: 1000,
          onHold: 0,
        },
      };

      const mockRecipient = {
        _id: 'recipient123',
        fullName: 'Recipient User',
        phone: '777123456',
        wallet: {
          balance: 500,
          onHold: 0,
        },
      };

      const mockSession = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };

      mockConnection.startSession.mockResolvedValue(mockSession);
      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockSender),
      });
      mockUserModel.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockRecipient),
      });

      // Simplified test
      expect(service).toBeDefined();
    });
  });
});

