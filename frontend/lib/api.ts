import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== АВТОРИЗАЦИЯ ==========
export const register = async (email: string, password: string, full_name: string) => {
  const response = await api.post('/auth/register', { email, password, full_name });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('grant_type', 'password');
  
  const response = await api.post('/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ========== ВИШЛИСТЫ ==========
export interface Wishlist {
  id: number;
  title: string;
  description: string | null;
  user_id: number;
  share_code: string;
  is_public: boolean;
  created_at: string;
  updated_at: string | null;
}

export const getWishlists = async (): Promise<Wishlist[]> => {
  const response = await api.get('/wishlists');
  return response.data;
};

export const createWishlist = async (title: string, description: string = '', is_public: boolean = true) => {
  const response = await api.post('/wishlists', { title, description, is_public });
  return response.data;
};

export const getWishlist = async (id: number): Promise<Wishlist> => {
  const response = await api.get(`/wishlists/${id}`);
  return response.data;
};

export const updateWishlist = async (id: number, title: string, description: string, is_public: boolean) => {
  const response = await api.put(`/wishlists/${id}`, { title, description, is_public });
  return response.data;
};

export const deleteWishlist = async (id: number) => {
  const response = await api.delete(`/wishlists/${id}`);
  return response.data;
};

// ========== ТОВАРЫ ==========
export interface Item {
  id: number;
  wishlist_id: number;
  name: string;
  description: string | null;
  price: number;
  url: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export const createItem = async (
  wishlist_id: number, 
  name: string, 
  price: number, 
  description?: string, 
  url?: string, 
  image_url?: string
): Promise<Item> => {
  const response = await api.post('/items', { wishlist_id, name, description, price, url, image_url });
  return response.data;
};

export const getItemsByWishlist = async (wishlist_id: number): Promise<Item[]> => {
  const response = await api.get(`/items/wishlist/${wishlist_id}`);
  return response.data;
};

export const getItem = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

export const updateItem = async (id: number, data: Partial<Item>) => {
  const response = await api.put(`/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id: number) => {
  const response = await api.delete(`/items/${id}`);
  return response.data;
};

// ========== РЕЗЕРВАЦИИ ==========
export interface ReservationStatus {
  item_id: number;
  is_reserved: boolean;
}

export const reserveItem = async (item_id: number) => {
  const response = await api.post('/reservations', { item_id });
  return response.data;
};

export const cancelReservation = async (item_id: number) => {
  const response = await api.delete(`/reservations/${item_id}`);
  return response.data;
};

export const getReservationStatus = async (item_id: number): Promise<ReservationStatus> => {
  const response = await api.get(`/reservations/item/${item_id}`);
  return response.data;
};

// ========== ВКЛАДЫ ==========
export interface ItemProgress {
  item_id: number;
  item_name: string;
  item_price: number;
  total_collected: number;
  progress_percent: number;
  contributors_count: number;
  remaining: number;
  is_fully_funded: boolean;
}

export const contribute = async (item_id: number, amount: number) => {
  if (amount < 10) throw new Error('Minimum contribution is $10');
  const response = await api.post('/contributions', { item_id, amount });
  return response.data;
};

export const getItemProgress = async (item_id: number): Promise<ItemProgress> => {
  const response = await api.get(`/contributions/item/${item_id}/progress`);
  return response.data;
};

export const getMyContribution = async (item_id: number): Promise<number> => {
  const response = await api.get(`/contributions/item/${item_id}/my-contribution`);
  return response.data;
};

export default api;