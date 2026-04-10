import { apiClient } from "./auth";

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Provider {
  id: number;
  email: string;
}

export interface AppointmentCreate {
  title: string;
  description?: string;
  dateTime: string;
  durationMinutes: number;
  providerId: number;
}

export interface AppointmentUpdate {
  title?: string;
  description?: string;
  dateTime?: string;
  durationMinutes?: number;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

export interface Appointment {
  id: number;
  title: string;
  description?: string;
  dateTime: string;
  durationMinutes: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  clientId: number;
  providerId: number;
  businessId?: number;
  serviceId?: number;
  createdAt: string;
  updatedAt: string;
}

export const appointmentService = {
  async getUserAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>("/appointments/me");
    return response.data;
  },

  async createAppointment(data: AppointmentCreate): Promise<Appointment> {
    const response = await apiClient.post<Appointment>("/appointments", data);
    return response.data;
  },

  async getAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  async updateAppointment(id: number, data: AppointmentUpdate): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  async confirmAppointment(id: number): Promise<Appointment> {
    return this.updateAppointment(id, { status: "CONFIRMED" });
  },

  async completeAppointment(id: number): Promise<Appointment> {
    return this.updateAppointment(id, { status: "COMPLETED" });
  },

  async cancelAppointment(id: number): Promise<Appointment> {
    return this.updateAppointment(id, { status: "CANCELLED" });
  },

  async deleteAppointment(id: number): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  },

  async getProviders(): Promise<Provider[]> {
    const response = await apiClient.get<Provider[]>("/appointments/providers");
    return response.data;
  },
};
