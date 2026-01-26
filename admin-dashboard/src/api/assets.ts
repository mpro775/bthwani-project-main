import axiosInstance from "../utils/axios";

export interface Asset {
  _id?: string;
  name: string;
  category: string;
  serialNumber?: string;
  purchaseDate: string;
  status: 'available' | 'in-use' | 'maintenance' | 'lost';
  assignedTo?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetFormData {
  name: string;
  category: string;
  serialNumber?: string;
  purchaseDate: string;
  status: 'available' | 'in-use' | 'maintenance' | 'lost';
  assignedTo?: string;
  location?: string;
}

export interface AssetStats {
  totalAssets: number;
  availableAssets: number;
  inUseAssets: number;
  maintenanceAssets: number;
  lostAssets: number;
  totalValue: number;
}

// Get all assets
export async function getAssets(): Promise<Asset[]> {
  const { data } = await axiosInstance.get<Asset[]>("/er/assets", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get asset by ID
export async function getAsset(id: string): Promise<Asset> {
  const { data } = await axiosInstance.get<Asset>(`/er/assets/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new asset
export async function createAsset(asset: AssetFormData): Promise<Asset> {
  const { data } = await axiosInstance.post<Asset>("/er/assets", asset);
  return data;
}

// Update asset
export async function updateAsset(id: string, asset: Partial<AssetFormData>): Promise<Asset> {
  const { data } = await axiosInstance.patch<Asset>(`/er/assets/${id}`, asset);
  return data;
}

// Delete asset
export async function deleteAsset(id: string): Promise<void> {
  await axiosInstance.delete(`/er/assets/${id}`);
}

// Get asset statistics
export async function getAssetStats(): Promise<AssetStats> {
  const { data } = await axiosInstance.get<AssetStats>("/er/assets/stats", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Assign asset to employee
export async function assignAsset(assetId: string, employeeId: string): Promise<Asset> {
  const { data } = await axiosInstance.patch<Asset>(`/er/assets/${assetId}/assign`, {
    employeeId
  });
  return data;
}

// Unassign asset
export async function unassignAsset(assetId: string): Promise<Asset> {
  const { data } = await axiosInstance.patch<Asset>(`/er/assets/${assetId}/unassign`);
  return data;
}
