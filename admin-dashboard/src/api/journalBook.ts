import axiosInstance from "../utils/axios";

export interface JournalBookEntry {
  entryId: string;
  lineIndex?: number;
  voucherNo: string;
  date: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
}

export interface JournalBook {
  _id?: string;
  account: string;
  entries: JournalBookEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalBookQuery {
  accountId?: string;
  from?: string;
  to?: string;
  voucherType?: string;
  all?: boolean;
  includeDescendants?: boolean;
  page?: number;
  pageSize?: number;
}

export interface JournalBookResponse {
  entries: Array<{
    _id: string;
    voucherNo: string;
    date: string;
    description: string;
    reference?: string;
    debit: number;
    credit: number;
    accountId: string;
    accountCode: string;
    accountName: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
  openingBalance: number;
}

// Get journal book for specific account with pagination
export async function getJournalBook(query: JournalBookQuery = {}): Promise<JournalBookResponse> {
  const { data } = await axiosInstance.get<JournalBookResponse>("/er/journals", {
    params: query,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get journal book for specific account (all entries)
export async function getAccountJournalBook(
  accountId: string,
  params?: {
    from?: string;
    to?: string;
    voucherType?: string;
    includeDescendants?: boolean;
  }
): Promise<JournalBookResponse> {
  return getJournalBook({
    accountId,
    all: true,
    ...params,
  });
}

// Get opening balance for account
export async function getAccountOpeningBalance(
  accountId: string,
  from?: string,
  voucherType?: string
): Promise<{ openingBalance: number }> {
  const { data } = await axiosInstance.get<{ openingBalance: number }>("/er/journals", {
    params: {
      accountId,
      from,
      voucherType,
      page: 1,
      pageSize: 1,
    },
    headers: { "x-silent-401": "1" }
  });
  return { openingBalance: data.openingBalance };
}
