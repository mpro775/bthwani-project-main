export type ErrandCategory =
  | "docs"
  | "parcel"
  | "groceries"
  | "carton"
  | "food"
  | "fragile"
  | "other";

export type ErrandSize = "small" | "medium" | "large";
export type PayMethod = "wallet" | "cash" | "card" | "mixed";

export type PointLocation = { lat: number | null; lng: number | null };

export interface ErrandPoint {
  label?: string;
  street?: string;
  city?: string;
  contactName?: string;
  phone?: string;
  location: PointLocation;
}

export interface Waypoint {
  label?: string;
  location: { lat: number; lng: number };
}

export interface ErrandForm {
  category: ErrandCategory;
  size?: ErrandSize;
  weightKg?: string;
  description?: string;
  pickup: ErrandPoint;
  dropoff: ErrandPoint;
  waypoints: Waypoint[];
  tip: string;
  scheduledFor?: string | null;
  paymentMethod: PayMethod;
  notes?: string;
}

export const initialForm: ErrandForm = {
  category: "other",
  size: "small",
  weightKg: "",
  description: "",
  pickup: {
    label: "",
    street: "",
    city: "",
    contactName: "",
    phone: "",
    location: { lat: null, lng: null },
  },
  dropoff: {
    label: "",
    street: "",
    city: "",
    contactName: "",
    phone: "",
    location: { lat: null, lng: null },
  },
  waypoints: [],
  tip: "",
  scheduledFor: null,
  paymentMethod: "wallet",
  notes: "",
};
