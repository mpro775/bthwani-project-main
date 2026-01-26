import axiosInstance from "../utils/axios";

export interface JournalEntryLine {
  account: string;
  name?: string;
  desc?: string;
  debit: number;
  credit: number;
  currency?: string;
  rate?: number;
}

export interface JournalEntry {
  _id?: string;
  voucherNo: string;
  date: string;
  description: string;
  reference?: string;
  branchNo?: string;
  voucherType?: string;
  isPosted: boolean;
  lines: JournalEntryLine[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalEntryQuery {
  page?: number;
  pageSize?: number;
  account?: string;
  from?: string;
  to?: string;
  voucherNo?: string;
  description?: string;
  isPosted?: boolean;
}

// Get next voucher number
export async function getNextVoucherNo(): Promise<{ voucherNo: string }> {
  const { data } = await axiosInstance.get<{ voucherNo: string }>("/er/entries/next-no", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// List journal entries with pagination and filters
export async function listJournalEntries(query: JournalEntryQuery = {}): Promise<{
  entries: JournalEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const { data } = await axiosInstance.get<{
    entries: JournalEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>("/er/entries", {
    params: query,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get single journal entry by voucher number
export async function getJournalEntry(voucherNo: string): Promise<JournalEntry> {
  const { data } = await axiosInstance.get<JournalEntry>(`/er/entries/${voucherNo}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new journal entry
export async function createJournalEntry(entry: Omit<JournalEntry, '_id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
  const { data } = await axiosInstance.post<JournalEntry>("/er/entries", entry);
  return data;
}

// Update journal entry
export async function updateJournalEntry(voucherNo: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
  const { data } = await axiosInstance.put<JournalEntry>(`/er/entries/${voucherNo}`, entry);
  return data;
}

// Post (approve) journal entry
export async function postJournalEntry(voucherNo: string): Promise<{ ok: true }> {
  const { data } = await axiosInstance.post<{ ok: true }>(`/er/entries/${voucherNo}/post`);
  return data;
}

// Validate journal entry balance
export function validateJournalEntryBalance(lines: JournalEntryLine[]): {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);

  return {
    isBalanced: difference < 0.01, // Allow for floating point precision
    totalDebit,
    totalCredit,
    difference,
  };
}
