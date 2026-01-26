import axiosInstance from "../utils/axios";

export interface ChartAccount {
  _id?: string;
  name: string;
  code: string;
  parent?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all accounts with optional filtering
export async function getAccounts(params?: {
  query?: string;
  onlyLeaf?: boolean;
  limit?: number;
}): Promise<ChartAccount[]> {
  const { data } = await axiosInstance.get<ChartAccount[]>("/er/accounts/chart", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get accounts tree structure
export async function getAccountsTree(): Promise<ChartAccount[]> {
  const { data } = await axiosInstance.get<ChartAccount[]>("/er/accounts/chart/tree", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get accounts for analysis (leaf accounts only)
export async function getAccountsAnalysis(onlyLeaf: boolean = true): Promise<ChartAccount[]> {
  const { data } = await axiosInstance.get<ChartAccount[]>("/er/accounts/chart/analysis", {
    params: { onlyLeaf },
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get single account by ID
export async function getAccount(id: string): Promise<ChartAccount> {
  const { data } = await axiosInstance.get<ChartAccount>(`/er/accounts/chart/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new account
export async function createAccount(account: Omit<ChartAccount, '_id' | 'createdAt' | 'updatedAt'>): Promise<ChartAccount> {
  const { data } = await axiosInstance.post<ChartAccount>("/er/accounts/chart", account);
  return data;
}

// Update account
export async function updateAccount(id: string, account: Partial<ChartAccount>): Promise<ChartAccount> {
  const { data } = await axiosInstance.patch<ChartAccount>(`/er/accounts/chart/${id}`, account);
  return data;
}

// Delete account and its children
export async function deleteAccount(id: string): Promise<void> {
  await axiosInstance.delete(`/er/accounts/chart/${id}`);
}
