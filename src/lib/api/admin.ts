import { apiClient } from "./auth";

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
  _count: {
    users: number;
    services: number;
    appointments: number;
  };
}

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
};
