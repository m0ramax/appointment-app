import { apiClient } from "./auth";

// Types
export interface WorkSchedule {
  id: number;
  provider_id: number;
  day_of_week: number; // 0=Sunday, 1=Monday, etc.
  start_time: string;  // "09:00"
  end_time: string;    // "17:00"
  is_active: boolean;
  slot_duration_minutes: number;
  break_start?: string;
  break_end?: string;
}

export interface WorkScheduleCreate {
  provider_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active?: boolean;
  break_start?: string;
  break_end?: string;
}

export interface WorkScheduleUpdate {
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  is_active?: boolean;
  break_start?: string;
  break_end?: string;
}

export interface ScheduleException {
  id: number;
  provider_id: number;
  date: string; // "2025-07-26"
  exception_type: "day_off" | "vacation" | "custom_hours" | "holiday";
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  reason?: string;
}

export interface ScheduleExceptionCreate {
  provider_id: number;
  date: string;
  exception_type: "day_off" | "vacation" | "custom_hours" | "holiday";
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  reason?: string;
}

export interface ProviderSettings {
  id: number;
  provider_id: number;
  default_slot_duration: number;
  advance_booking_days: number;
  same_day_booking: boolean;
  timezone: string;
}

export interface ProviderSettingsCreate {
  provider_id: number;
  default_slot_duration: number;
  advance_booking_days: number;
  same_day_booking: boolean;
  timezone: string;
}

export interface ProviderAvailability {
  provider_id: number;
  date: string;
  is_available: boolean;
  reason?: string;
  available_slots: Array<{
    start: string;
    end: string;
    available: boolean;
  }>;
}

export const workScheduleService = {
  // ========== WORK SCHEDULES ==========
  
  async createWorkSchedule(schedule: WorkScheduleCreate): Promise<WorkSchedule> {
    const response = await apiClient.post<WorkSchedule>("/api/v1/work-schedules/schedules", schedule);
    return response.data;
  },

  async getProviderWorkSchedules(providerId: number): Promise<WorkSchedule[]> {
    const response = await apiClient.get<WorkSchedule[]>(`/api/v1/work-schedules/schedules/${providerId}`);
    return response.data;
  },

  async updateWorkSchedule(scheduleId: number, schedule: WorkScheduleUpdate): Promise<WorkSchedule> {
    const response = await apiClient.put<WorkSchedule>(`/api/v1/work-schedules/schedules/${scheduleId}`, schedule);
    return response.data;
  },

  async deleteWorkSchedule(scheduleId: number): Promise<void> {
    await apiClient.delete(`/api/v1/work-schedules/schedules/${scheduleId}`);
  },

  // ========== SCHEDULE EXCEPTIONS ==========

  async createScheduleException(exception: ScheduleExceptionCreate): Promise<ScheduleException> {
    const response = await apiClient.post<ScheduleException>("/api/v1/work-schedules/exceptions", exception);
    return response.data;
  },

  async getScheduleExceptions(
    providerId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<ScheduleException[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    
    const response = await apiClient.get<ScheduleException[]>(
      `/api/v1/work-schedules/exceptions/${providerId}?${params.toString()}`
    );
    return response.data;
  },

  async updateScheduleException(exceptionId: number, exception: Partial<ScheduleExceptionCreate>): Promise<ScheduleException> {
    const response = await apiClient.put<ScheduleException>(`/api/v1/work-schedules/exceptions/${exceptionId}`, exception);
    return response.data;
  },

  async deleteScheduleException(exceptionId: number): Promise<void> {
    await apiClient.delete(`/api/v1/work-schedules/exceptions/${exceptionId}`);
  },

  // ========== PROVIDER SETTINGS ==========

  async createOrUpdateProviderSettings(settings: ProviderSettingsCreate): Promise<ProviderSettings> {
    const response = await apiClient.post<ProviderSettings>("/api/v1/work-schedules/settings", settings);
    return response.data;
  },

  async getProviderSettings(providerId: number): Promise<ProviderSettings> {
    const response = await apiClient.get<ProviderSettings>(`/api/v1/work-schedules/settings/${providerId}`);
    return response.data;
  },

  // ========== AVAILABILITY ==========

  async getProviderAvailability(providerId: number, date: string): Promise<ProviderAvailability> {
    const response = await apiClient.get<ProviderAvailability>(`/api/v1/work-schedules/availability/${providerId}/${date}`);
    return response.data;
  },

  async getWeeklySchedule(providerId: number): Promise<{
    provider_id: number;
    schedules: WorkSchedule[];
    settings: ProviderSettings;
  }> {
    const response = await apiClient.get(`/api/v1/work-schedules/weekly-schedule/${providerId}`);
    return response.data;
  },

  // ========== UTILITY FUNCTIONS ==========

  getDayName(dayOfWeek: number): string {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[dayOfWeek] || "Desconocido";
  },

  formatTime(timeString: string): string {
    // Convert "09:00:00" to "09:00"
    return timeString.substring(0, 5);
  },

  getExceptionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      day_off: "Día libre",
      vacation: "Vacaciones",
      custom_hours: "Horario personalizado",
      holiday: "Día festivo"
    };
    return labels[type] || type;
  }
};