import axiosInstance from "../utils/axios";

export interface DriverRating {
  _id?: string;
  order: string;
  driver: string;
  user: string;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverRatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentRatings: DriverRating[];
}

// Get all driver ratings
export async function getDriverRatings(params?: {
  driver?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}): Promise<{
  ratings: DriverRating[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const { data } = await axiosInstance.get<{
    ratings: DriverRating[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/drivers/ratings", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver rating statistics
export async function getDriverRatingStats(driverId: string): Promise<DriverRatingStats> {
  const { data } = await axiosInstance.get<DriverRatingStats>(`/admin/drivers/${driverId}/ratings/stats`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get driver ratings by driver
export async function getDriverRatingsByDriver(driverId: string, params?: {
  page?: number;
  pageSize?: number;
}): Promise<{
  ratings: DriverRating[];
  total: number;
  page: number;
  pageSize: number;
}> {
  return getDriverRatings({ driver: driverId, ...params });
}

// Get recent driver ratings
export async function getRecentDriverRatings(limit: number = 10): Promise<DriverRating[]> {
  const { data } = await axiosInstance.get<DriverRating[]>("/admin/drivers/ratings/recent", {
    params: { limit },
    headers: { "x-silent-401": "1" }
  });
  return data;
}
