import { apiClient } from "./auth";

export interface TeamMember {
  id: number;
  email: string;
  role: string;
}

export interface WorkSchedule {
  id: number;
  providerId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  slotDurationMinutes: number;
  breakStart?: string;
  breakEnd?: string;
}

export interface WorkScheduleCreate {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  breakStart?: string;
  breakEnd?: string;
}

export interface WorkScheduleUpdate {
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  isActive?: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface ScheduleException {
  id: number;
  providerId: number;
  date: string;
  exceptionType: "DAY_OFF" | "VACATION" | "CUSTOM_HOURS" | "HOLIDAY";
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  reason?: string;
}

export interface ScheduleExceptionCreate {
  date: string;
  exceptionType: "DAY_OFF" | "VACATION" | "CUSTOM_HOURS" | "HOLIDAY";
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  reason?: string;
}

export interface ProviderSettings {
  id: number;
  providerId: number;
  defaultSlotDuration: number;
  advanceBookingDays: number;
  sameDayBooking: boolean;
  timezone: string;
}

export interface ProviderSettingsUpsert {
  defaultSlotDuration?: number;
  advanceBookingDays?: number;
  sameDayBooking?: boolean;
  timezone?: string;
}

export interface ProviderAvailability {
  isAvailable: boolean;
  reason: string;
  availableSlots: Array<{ start: string; end: string }>;
}

export const workScheduleService = {
  // ── Schedules ──────────────────────────────────────────────────────────────

  async createWorkSchedule(schedule: WorkScheduleCreate, forProvider?: number): Promise<WorkSchedule> {
    const url = forProvider ? `/work-schedules?forProvider=${forProvider}` : "/work-schedules";
    const response = await apiClient.post<WorkSchedule>(url, schedule);
    return response.data;
  },

  async getMyWorkSchedules(forProvider?: number): Promise<WorkSchedule[]> {
    const url = forProvider ? `/work-schedules?forProvider=${forProvider}` : "/work-schedules";
    const response = await apiClient.get<WorkSchedule[]>(url);
    return response.data;
  },

  async updateWorkSchedule(scheduleId: number, schedule: WorkScheduleUpdate): Promise<WorkSchedule> {
    const response = await apiClient.put<WorkSchedule>(`/work-schedules/${scheduleId}`, schedule);
    return response.data;
  },

  async deleteWorkSchedule(scheduleId: number): Promise<void> {
    await apiClient.delete(`/work-schedules/${scheduleId}`);
  },

  // ── Exceptions ─────────────────────────────────────────────────────────────

  async createScheduleException(exception: ScheduleExceptionCreate): Promise<ScheduleException> {
    const response = await apiClient.post<ScheduleException>("/work-schedules/exceptions", exception);
    return response.data;
  },

  async getScheduleExceptions(startDate?: string, endDate?: string): Promise<ScheduleException[]> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const response = await apiClient.get<ScheduleException[]>(`/work-schedules/exceptions?${params.toString()}`);
    return response.data;
  },

  async deleteScheduleException(exceptionId: number): Promise<void> {
    await apiClient.delete(`/work-schedules/exceptions/${exceptionId}`);
  },

  // ── Settings ───────────────────────────────────────────────────────────────

  async upsertProviderSettings(settings: ProviderSettingsUpsert): Promise<ProviderSettings> {
    const response = await apiClient.post<ProviderSettings>("/work-schedules/settings", settings);
    return response.data;
  },

  async getMySettings(): Promise<ProviderSettings> {
    const response = await apiClient.get<ProviderSettings>("/work-schedules/settings");
    return response.data;
  },

  // ── Availability ───────────────────────────────────────────────────────────

  async getProviderAvailability(providerId: number, date: string): Promise<ProviderAvailability> {
    const response = await apiClient.get<ProviderAvailability>(`/work-schedules/availability/${providerId}/${date}`);
    return response.data;
  },

  // ── Utils ──────────────────────────────────────────────────────────────────

  async getTeam(): Promise<TeamMember[]> {
    const response = await apiClient.get<TeamMember[]>("/business/team");
    return response.data;
  },

  getDayName(dayOfWeek: string): string {
    const days: Record<string, string> = {
      SUNDAY: "Domingo", MONDAY: "Lunes", TUESDAY: "Martes",
      WEDNESDAY: "Miércoles", THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado",
    };
    return days[dayOfWeek] ?? dayOfWeek;
  },

  getExceptionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      DAY_OFF: "Día libre", VACATION: "Vacaciones",
      CUSTOM_HOURS: "Horario personalizado", HOLIDAY: "Día festivo",
    };
    return labels[type] ?? type;
  },
};
