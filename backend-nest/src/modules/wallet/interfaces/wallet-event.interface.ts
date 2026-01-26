import {
  WalletEventType,
  WalletEventMetadata,
} from '../entities/wallet-event.entity';

export interface CreateWalletEventDto {
  userId: string;
  eventType: WalletEventType;
  amount: number;
  metadata?: WalletEventMetadata;
  correlationId?: string;
  causationId?: string;
}

export interface WalletSnapshot {
  userId: string;
  balance: number;
  onHold: number;
  totalEarned: number;
  totalSpent: number;
  lastEventSequence: number;
  snapshotAt: Date;
}

export interface EventReplayResult {
  success: boolean;
  eventsReplayed: number;
  finalBalance: number;
  finalOnHold: number;
  errors?: string[];
}
