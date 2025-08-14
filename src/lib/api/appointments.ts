import { apiClient } from "./auth";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface Provider {
  id: number;
  email: string;
  name: string;
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
    const response = await apiClient.get<Appointment[]>("/api/v1/appointments/me");
    return response.data;
  },

  // Crear una nueva cita
  async createAppointment(
    appointmentData: AppointmentCreate
  ): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(
      "/api/v1/appointments/",
      appointmentData
    );
    return response.data;
  },

  // Obtener una cita específica
  async getAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/api/v1/appointments/${id}`);
    return response.data;
  },

  // Actualizar una cita
  async updateAppointment(
    id: number,
    appointmentData: AppointmentUpdate
  ): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(
      `/api/v1/appointments/${id}`,
      appointmentData
    );
    return response.data;
  },

  // Cancelar una cita
  async cancelAppointment(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/appointments/${id}`);
  },

  // Verificar disponibilidad para una fecha
  async getAvailableSlots(
    date: string,
    providerId: number
  ): Promise<TimeSlot[]> {
    const response = await apiClient.get<TimeSlot[]>(
      `/api/v1/appointments/availability/${date}`,
      {
        params: { provider_id: providerId },
      }
    );
    return response.data;
  },

  // Obtener lista de proveedores
  async getProviders(): Promise<Provider[]> {
    const response = await apiClient.get<Provider[]>("/api/v1/appointments/providers");
    return response.data;
  },

  // Validar disponibilidad de un horario específico
  async validateAvailability(
    providerId: number,
    dateTime: string,
    durationMinutes: number = 30
  ): Promise<{available: boolean; reason: string; conflicting_appointment?: any}> {
    const response = await apiClient.post("/api/v1/appointments/validate-availability", null, {
      params: {
        provider_id: providerId,
        date_time: dateTime,
        duration_minutes: durationMinutes
      }
    });
    return response.data;
  },

  // State transition methods
  async confirmAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/api/v1/appointments/${id}/confirm`);
    return response.data;
  },

  async completeAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/api/v1/appointments/${id}/complete`);
    return response.data;
  },

  async cancelAppointmentByStatus(id: number): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/api/v1/appointments/${id}/cancel`);
    return response.data;
  },
};
