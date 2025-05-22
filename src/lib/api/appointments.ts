import { apiClient } from "./auth";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AppointmentBase {
  title: string;
  description?: string;
  date_time: string;
  duration_minutes: number;
}

export interface AppointmentCreate extends AppointmentBase {
  provider_id: number;
}

export interface AppointmentUpdate {
  title?: string;
  description?: string;
  date_time?: string;
  duration_minutes?: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface Appointment extends AppointmentBase {
  id: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  client_id: number;
  provider_id: number;
  created_at: string;
  updated_at?: string;
}

export const appointmentService = {
  // Obtener citas del usuario actual
  async getUserAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>("/appointments/me");
    return response.data;
  },

  // Crear una nueva cita
  async createAppointment(
    appointmentData: AppointmentCreate
  ): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      "/appointments",
      appointmentData
    );
    return response.data;
  },

  // Obtener una cita específica
  async getAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  // Actualizar una cita
  async updateAppointment(
    id: number,
    appointmentData: AppointmentUpdate
  ): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(
      `/appointments/${id}`,
      appointmentData
    );
    return response.data;
  },

  // Cancelar una cita
  async cancelAppointment(id: number): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  },

  // Verificar disponibilidad para una fecha
  // Este método necesitará implementarse en el backend
  async getAvailableSlots(
    date: string,
    providerId: number
  ): Promise<TimeSlot[]> {
    const response = await apiClient.get<TimeSlot[]>(
      `/appointments/availability/${date}`,
      {
        params: { provider_id: providerId },
      }
    );
    return response.data;
  },
};
