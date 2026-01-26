import axiosInstance from "./axiosInstance";

export interface VendorProfile {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  store: {
    _id: string;
    name_ar?: string;
    name_en?: string;
    isActive: boolean;
  };
  isActive: boolean;
  salesCount: number;
  totalRevenue: number;
  notificationSettings?: {
    enabled: boolean;
    orderAlerts: boolean;
    financialAlerts: boolean;
    marketingAlerts: boolean;
    systemUpdates: boolean;
  };
  createdAt: string;
}

export interface UpdateVendorDto {
  expoPushToken?: string;
  notificationSettings?: {
    enabled?: boolean;
    orderAlerts?: boolean;
    financialAlerts?: boolean;
    marketingAlerts?: boolean;
    systemUpdates?: boolean;
  };
}

// Get vendor profile
export const getProfile = async () => {
  const { data } = await axiosInstance.get<VendorProfile>("/vendors/me");
  return data;
};

// Update vendor profile
export const updateProfile = async (updates: UpdateVendorDto) => {
  const { data } = await axiosInstance.patch<VendorProfile>(
    "/vendors/me",
    updates
  );
  return data;
};

// Update push token
export const updatePushToken = async (token: string) => {
  const { data } = await axiosInstance.patch("/vendors/me", {
    expoPushToken: token,
  });
  return data;
};

