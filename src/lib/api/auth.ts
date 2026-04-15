import axios from "axios";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  businessId?: number | null;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const safeStorage = {
  get: (key: string): string | null => {
    try {
      if (typeof window !== "undefined") return localStorage.getItem(key);
    } catch {}
    return null;
  },
  set: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined") localStorage.setItem(key, value);
    } catch {}
  },
  remove: (key: string): void => {
    try {
      if (typeof window !== "undefined") localStorage.removeItem(key);
    } catch {}
  },
};

apiClient.interceptors.request.use((config) => {
  const token = safeStorage.get("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    safeStorage.set("token", response.data.access_token);
    return response.data;
  },

  async registerOwner(credentials: RegisterCredentials, token: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(`/auth/register/owner?token=${token}`, credentials);
    safeStorage.set("token", response.data.access_token);
    return response.data;
  },

  async registerProvider(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register/provider", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    safeStorage.remove("token");
  },

  async getProfile(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) return null;
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    try {
      return !!safeStorage.get("token");
    } catch {
      return false;
    }
  },
};
