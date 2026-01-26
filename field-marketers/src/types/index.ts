export type OnbStatus =
  | "draft"
  | "submitted"
  | "needs_fix"
  | "approved"
  | "rejected";

export type OnboardingDraft = {
  _id?: string;
  storeDraft: {
    name: string;
    address: string;
    category: string; // id
    location: { lat: number; lng: number };
    image?: string;
    logo?: string;
    tags?: string[];
    usageType?: string;
  };
  ownerDraft?: { fullName?: string; phone?: string; email?: string };
  attachments?: { url: string; kind?: string; note?: string }[];
  participants?: { uid: string; role?: "lead" | "support"; weight?: number }[];
  status?: OnbStatus;
};
