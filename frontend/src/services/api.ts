import { CampusBlock, Category, Course, FeedResponse, Item } from '../types';

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
  try {
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

      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('achei_token');
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err: any) {
    if (err.message !== 'Token de autenticação não fornecido.') {
      console.error(`[API Fetch Error] ${url}:`, err.message || err);
    }
    throw new Error(err.message || 'Falha na conexão com a API da Unochapecó.');
  }
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

export async function getCourses(): Promise<Course[]> {
  return fetchApi<Course[]>('/courses');
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

// ==========================================
// AUTENTICAÇÃO E SESSÃO
// ==========================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  academicCourse?: string;
}

export interface AuthResponse {
  token: string;
  user: any;
}

export async function loginUser(data: LoginDto): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function registerUser(data: RegisterDto): Promise<AuthResponse> {
  return fetchApi<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function saveAuthSession(token: string, user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('achei_token', token);
    localStorage.setItem('achei_user', JSON.stringify(user));
    document.cookie = `achei_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function clearAuthSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('achei_token');
    localStorage.removeItem('achei_user');
    document.cookie = 'achei_token=; path=/; max-age=0; SameSite=Lax';
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('achei_token');
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getCurrentUser(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('achei_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

// ==========================================
// PERFIL DO USUÁRIO & ITENS PESSOAIS
// ==========================================

export async function getMyProfile(): Promise<any> {
  if (!getAuthToken()) return null;
  return fetchApi<any>('/users/me');
}

export async function updateMyProfile(data: { name?: string; academicCourse?: string; avatarUrl?: string }): Promise<any> {
  return fetchApi<any>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getMyItems(): Promise<Item[]> {
  if (!getAuthToken()) return [];
  return fetchApi<Item[]>('/users/me/items');
}

export async function getMySavedItems(): Promise<Item[]> {
  if (!getAuthToken()) return [];
  return fetchApi<Item[]>('/users/me/saved');
}

// ==========================================
// RANKING E BADGES
// ==========================================

export async function getLeaderboard(): Promise<any> {
  return fetchApi<any>('/rankings');
}

export async function getBadgesList(): Promise<any> {
  return fetchApi<any>('/badges');
}

// ==========================================
// UPLOAD DE IMAGENS (CLOUDINARY)
// ==========================================

export async function uploadImageToCloudinary(
  file: File,
  folder: 'items' | 'users' | 'banners' | 'brands' = 'items'
): Promise<{ url: string; publicId: string; format?: string; width?: number; height?: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Falha no upload da imagem para o Cloudinary.';
    try {
      const errorData = await response.json();
      if (errorData.message) errorMessage = errorData.message;
    } catch {
      // Ignora erro de parse
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
