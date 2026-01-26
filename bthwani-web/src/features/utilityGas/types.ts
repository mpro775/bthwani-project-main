export type Address = {
    _id: string;
    label: string;
    street?: string;
    city: string;
    location: { lat: number; lng: number };
  };
  
  export type PayMethod = "cash" | "wallet" | "card" | "mixed";
  
  export type UtilityGasOptions = {
    cylinderSizeLiters: number;
    pricePerCylinder: number;
    minQty: number;
    deliveryPolicy: "flat" | "strategy";
    flatFee: number | null;
  };
  
  export type UtilityOptionsResp = {
    city: string;
    gas: UtilityGasOptions | null;
    water: unknown;
  };
  
  export type GasOrderPayload = {
    kind: "gas";
    city: string;
    variant: string; // e.g. "20L"
    quantity: number;
    paymentMethod: PayMethod;
    addressId: string;
    notes?: { body: string; visibility: "public" }[];
    scheduledFor?: string; // ISO
  };
  
  export type UserProfile = {
    _id: string;
    defaultAddressId?: string | null;
    addresses: Address[];
  };