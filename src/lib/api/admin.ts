import axios from "axios";
import { apiClient } from "./auth";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";

export interface PlatformSettings {
  registrationEnabled: boolean;
}

export interface InviteToken {
  id: number;
  token: string;
  note?: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  usedByBusinessId?: number;
}

export interface AdminStats {
  businesses: number;
  activeInvites: number;
}

export interface Business {
  id: number;
  name: string;
  whatsappNumber: string;
  allowProviderSelection: boolean;
  suspended: boolean;
  teamMode: boolean;
  _count: {
    users: number;
    services: number;
    appointments: number;
  };
}

// Uses a plain axios instance — no JWT required
const publicClient = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

export const platformSettingsService = {
  async get(): Promise<PlatformSettings> {
    const r = await publicClient.get<PlatformSettings>("/platform-settings");
    return r.data;
  },

  async update(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const r = await apiClient.patch<PlatformSettings>("/platform-settings", data);
    return r.data;
  },
};

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const r = await apiClient.get<AdminStats>("/invite/stats");
    return r.data;
  },

  async getInvites(): Promise<InviteToken[]> {
    const r = await apiClient.get<InviteToken[]>("/invite");
    return r.data;
  },

  async createInvite(note?: string): Promise<InviteToken> {
    const r = await apiClient.post<InviteToken>("/invite", { note });
    return r.data;
  },

  async revokeInvite(id: number): Promise<void> {
    await apiClient.put(`/invite/${id}/revoke`);
  },

  async getBusinesses(): Promise<Business[]> {
    const r = await apiClient.get<Business[]>("/business");
    return r.data;
  },

  async getAdminBusinesses(): Promise<Business[]> {
    const r = await apiClient.get<Business[]>('/admin/businesses');
    return r.data;
  },

  async suspendBusiness(id: number): Promise<Business> {
    const r = await apiClient.patch<Business>(`/admin/businesses/${id}/suspend`);
    return r.data;
  },

  async activateBusiness(id: number): Promise<Business> {
    const r = await apiClient.patch<Business>(`/admin/businesses/${id}/activate`);
    return r.data;
  },

  async deleteBusiness(id: number): Promise<void> {
    await apiClient.delete(`/admin/businesses/${id}`);
  },

  async toggleTeamMode(id: number, teamMode: boolean): Promise<Business> {
    const r = await apiClient.patch<Business>(`/admin/business/${id}/team-mode`, { teamMode });
    return r.data;
  },
};
