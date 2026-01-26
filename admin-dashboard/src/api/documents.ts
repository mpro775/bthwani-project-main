import axiosInstance from "../utils/axios";

export interface Document {
  _id?: string;
  title: string;
  type: string;
  asset?: string;
  category: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl: string;
  permissions: string[];
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentFormData {
  title: string;
  type: string;
  asset?: string;
  category: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl: string;
  permissions: string[];
  location?: string;
}

export interface DocumentStats {
  totalDocuments: number;
  expiredDocuments: number;
  expiringSoon: number;
  byCategory: {
    category: string;
    count: number;
  }[];
  byType: {
    type: string;
    count: number;
  }[];
}

// Get all documents with optional filters
export async function getDocuments(params?: {
  category?: string;
  type?: string;
  asset?: string;
  location?: string;
  expired?: boolean;
  expiringSoon?: boolean;
  page?: number;
  limit?: number;
}): Promise<{
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}> {
  const { data } = await axiosInstance.get<{
    documents: Document[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>("/er/documents", {
    params,
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get document by ID
export async function getDocument(id: string): Promise<Document> {
  const { data } = await axiosInstance.get<Document>(`/er/documents/${id}`, {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Create new document
export async function createDocument(document: DocumentFormData): Promise<Document> {
  const { data } = await axiosInstance.post<Document>("/er/documents", document);
  return data;
}

// Update document
export async function updateDocument(id: string, document: Partial<DocumentFormData>): Promise<Document> {
  const { data } = await axiosInstance.patch<Document>(`/er/documents/${id}`, document);
  return data;
}

// Delete document
export async function deleteDocument(id: string): Promise<void> {
  await axiosInstance.delete(`/er/documents/${id}`);
}

// Get document statistics
export async function getDocumentStats(): Promise<DocumentStats> {
  const { data } = await axiosInstance.get<DocumentStats>("/er/documents/stats", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Upload document file
export async function uploadDocumentFile(file: File): Promise<{ fileUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await axiosInstance.post<{ fileUrl: string }>("/er/documents/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

// Download document file
export async function downloadDocument(id: string): Promise<Blob> {
  const { data } = await axiosInstance.get(`/er/documents/${id}/download`, {
    responseType: 'blob',
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get documents expiring soon
export async function getExpiringSoonDocuments(days: number = 30): Promise<Document[]> {
  const { data } = await axiosInstance.get<Document[]>("/er/documents/expiring-soon", {
    params: { days },
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Get expired documents
export async function getExpiredDocuments(): Promise<Document[]> {
  const { data } = await axiosInstance.get<Document[]>("/er/documents/expired", {
    headers: { "x-silent-401": "1" }
  });
  return data;
}

// Bulk operations
export async function bulkUpdateDocuments(
  documentIds: string[],
  updates: Partial<DocumentFormData>
): Promise<Document[]> {
  const { data } = await axiosInstance.patch<Document[]>("/er/documents/bulk", {
    documentIds,
    updates,
  });
  return data;
}

export async function bulkDeleteDocuments(documentIds: string[]): Promise<void> {
  await axiosInstance.delete("/er/documents/bulk", {
    data: { documentIds },
  });
}

// Export documents
export async function exportDocuments(params?: {
  format?: 'excel' | 'csv' | 'pdf';
  category?: string;
  type?: string;
}): Promise<Blob> {
  const { data } = await axiosInstance.get("/er/documents/export", {
    params,
    responseType: 'blob',
    headers: { "x-silent-401": "1" }
  });
  return data;
}
