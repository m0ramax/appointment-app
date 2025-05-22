import axios from "axios";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:8000";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  role: "client" | "provider";
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
}

// Cliente axios con configuración base
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función segura para acceder a localStorage
const safeStorage = {
  get: (key: string): string | null => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn("Error accessing localStorage:", error);
    }
    return null;
  },
  set: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn("Error setting localStorage:", error);
    }
  },
  remove: (key: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn("Error removing from localStorage:", error);
    }
  },
};

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use((config) => {
  const token = safeStorage.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    try {
      const response = await apiClient.post<AuthResponse>(
        "/api/v1/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      safeStorage.set("token", response.data.access_token);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await apiClient.post<User>(
        "/api/v1/register",
        credentials
      );
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    safeStorage.remove("token");
  },

  async getProfile(): Promise<User | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }
      const response = await apiClient.get<User>("/api/v1/me");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    try {
      return !!safeStorage.get("token");
    } catch (error) {
      return false;
    }
  },
};
