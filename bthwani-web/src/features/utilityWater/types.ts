// src/features/utilityWater/types.ts
export type Address = {
  _id: string;
  label: string;
  street?: string;
  city: string;
  location: { lat: number; lng: number };
};

export type PayMethod = "cash" | "wallet" | "card" | "mixed";

export type WaterSizeKey = "small" | "medium" | "large";

export type WaterSize = {
  key: WaterSizeKey;
  capacityLiters: number;
  pricePerTanker: number;
};

export type WaterOptions = {
  sizes: WaterSize[];
  allowHalf: boolean;
  halfPolicy: "linear" | "multiplier" | "fixed";
  deliveryPolicy: "flat" | "strategy";
  flatFee: number | null;
};

export type UtilityOptionsResp = {
  city: string;
  gas: unknown;
  water: WaterOptions | null;
};

export type WaterOrderPayload = {
  kind: "water";
  city: string;
  variant: WaterSizeKey; // selected tanker size key
  quantity: number; // full: integer, half: 0.5
  paymentMethod: PayMethod;
  addressId: string;
  notes?: { body: string; visibility: "public" }[];
  scheduledFor?: string; // ISO string
};

export type UserProfile = {
  _id: string;
  defaultAddressId?: string | null;
  addresses: Address[];
};
