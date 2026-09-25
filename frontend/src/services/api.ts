import { CampusBlock, Category, FeedResponse, Item } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

function getHeaders(customHeaders: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('achei_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: getHeaders(options.headers as Record<string, string>),
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) errorMessage = errorData.message;
    } catch {
      // Ignore JSON parse error on non-JSON response
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ==========================================
// SERVIÇOS DE FEED E ITENS
// ==========================================

export interface GetItemsFilters {
  type?: 'LOST' | 'FOUND';
  blockId?: string;
  categoryId?: string;
  categorySlug?: string;
  q?: string;
  isCustody?: boolean;
  hasReward?: boolean;
  page?: number;
  limit?: number;
}

export async function getFeedItems(filters: GetItemsFilters = {}): Promise<FeedResponse> {
  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.blockId && filters.blockId !== 'all') params.append('blockId', filters.blockId);
  if (filters.categoryId && filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
  if (filters.categorySlug) params.append('categorySlug', filters.categorySlug);
  if (filters.q) params.append('q', filters.q);
  if (filters.isCustody !== undefined) params.append('isCustody', String(filters.isCustody));
  if (filters.hasReward !== undefined) params.append('hasReward', String(filters.hasReward));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const qs = params.toString();
  return fetchApi<FeedResponse>(`/items${qs ? `?${qs}` : ''}`);
}

export async function getItemById(id: string): Promise<Item> {
  return fetchApi<Item>(`/items/${id}`);
}

export interface CreateItemDto {
  title: string;
  description: string;
  type: 'LOST' | 'FOUND';
  categoryId: string;
  blockId: string;
  specificLocation?: string;
  photoUrl?: string;
  hasReward?: boolean;
  isUnderStaffCustody?: boolean;
  custodyLocation?: string;
}

export async function createItem(data: CreateItemDto): Promise<{ message: string; item: Item }> {
  return fetchApi<{ message: string; item: Item }>('/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function toggleItemLike(itemId: string): Promise<{ liked: boolean; totalLikes: number }> {
  return fetchApi<{ liked: boolean; totalLikes: number }>(`/items/${itemId}/like`, {
    method: 'POST',
  });
}

export async function toggleItemSave(itemId: string): Promise<{ saved: boolean }> {
  return fetchApi<{ saved: boolean }>(`/items/${itemId}/save`, {
    method: 'POST',
  });
}

// ==========================================
// REFERÊNCIAS (BLOCOS E CATEGORIAS)
// ==========================================

export async function getCampusBlocks(): Promise<CampusBlock[]> {
  return fetchApi<CampusBlock[]>('/blocks');
}

export async function getCategories(): Promise<Category[]> {
  return fetchApi<Category[]>('/categories');
}

// ==========================================
// PISTAS E REIVINDICAÇÕES (CLAIMS & PIN)
// ==========================================

export async function submitHint(itemId: string, content: string): Promise<any> {
  return fetchApi(`/items/${itemId}/hints`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function submitClaim(itemId: string, secretDetails: string): Promise<any> {
  return fetchApi(`/items/${itemId}/claims`, {
    method: 'POST',
    body: JSON.stringify({ secretDetails }),
  });
}

export async function confirmPinDelivery(claimId: string, code: string): Promise<any> {
  return fetchApi(`/claims/${claimId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}
