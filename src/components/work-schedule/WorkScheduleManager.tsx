import { useState, useEffect } from "react";
import { workScheduleService, type WorkSchedule, type WorkScheduleCreate, type ProviderSettings } from "../../lib/api/work-schedule";
import { authService } from "../../lib/api/auth";

interface WorkScheduleManagerProps {
  providerId?: number;
  onScheduleUpdate?: () => void;
}

export default function WorkScheduleManager({ providerId, onScheduleUpdate }: WorkScheduleManagerProps) {
  const [currentProviderId, setCurrentProviderId] = useState<number | null>(providerId || null);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const daysOfWeek = [
    { id: 1, name: "Lunes" },
    { id: 2, name: "Martes" },
    { id: 3, name: "Miércoles" },
    { id: 4, name: "Jueves" },
    { id: 5, name: "Viernes" },
    { id: 6, name: "Sábado" },
    { id: 0, name: "Domingo" }
  ];

  useEffect(() => {
    if (!currentProviderId) {
      // Get provider ID from current user
      authService.getProfile().then(user => {
        if (user && user.role === 'provider') {
          setCurrentProviderId(user.id);
        }
      }).catch(error => {
        console.error('Error getting user profile:', error);
        setError('Error al obtener información del usuario');
        setLoading(false);
      });
    } else {
      loadScheduleData();
    }
  }, [currentProviderId]);

  useEffect(() => {
    if (currentProviderId) {
      loadScheduleData();
    }
  }, [currentProviderId]);

  const loadScheduleData = async () => {
    if (!currentProviderId) return;
    
    setLoading(true);
    setError("");
    
    try {
      const [schedulesData, settingsData] = await Promise.all([
        workScheduleService.getProviderWorkSchedules(currentProviderId),
        workScheduleService.getProviderSettings(currentProviderId).catch(() => null)
      ]);
      
      setSchedules(schedulesData);
      setSettings(settingsData);
    } catch (err: any) {
      console.error("Error loading schedule data:", err);
      setError("Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (dayOfWeek: number) => {
    if (!currentProviderId) return;
    
    try {
      const newSchedule: WorkScheduleCreate = {
        provider_id: currentProviderId,
        day_of_week: dayOfWeek,
        start_time: "09:00",
        end_time: "17:00",
        slot_duration_minutes: settings?.default_slot_duration || 30,
        is_active: true
      };

      await workScheduleService.createWorkSchedule(newSchedule);
      await loadScheduleData();
      onScheduleUpdate?.();
      setEditingDay(null);
    } catch (err: any) {
      console.error("Error creating schedule:", err);
      setError(err.response?.data?.detail || "Error al crear horario");
    }
  };

  const handleUpdateSchedule = async (schedule: WorkSchedule, updates: any) => {
    try {
      await workScheduleService.updateWorkSchedule(schedule.id, updates);
      await loadScheduleData();
      onScheduleUpdate?.();
    } catch (err: any) {
      console.error("Error updating schedule:", err);
      setError(err.response?.data?.detail || "Error al actualizar horario");
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este horario?")) {
      return;
    }

    try {
      await workScheduleService.deleteWorkSchedule(scheduleId);
      await loadScheduleData();
      onScheduleUpdate?.();
    } catch (err: any) {
      console.error("Error deleting schedule:", err);
      setError(err.response?.data?.detail || "Error al eliminar horario");
    }
  };

  const getScheduleForDay = (dayOfWeek: number): WorkSchedule | null => {
    return schedules.find(s => s.day_of_week === dayOfWeek && s.is_active) || null;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando horarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Horarios de Trabajo
        </h3>
        <button
          onClick={loadScheduleData}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Configuración Semanal
          </h4>
        </div>

        <div className="divide-y divide-gray-200">
          {daysOfWeek.map((day) => {
            const schedule = getScheduleForDay(day.id);
            const isEditing = editingDay === day.id;

            return (
              <div key={day.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900 w-20">
                        {day.name}
                      </span>
                      
                      {schedule ? (
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {workScheduleService.formatTime(schedule.start_time)} - {workScheduleService.formatTime(schedule.end_time)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Slots de {schedule.slot_duration_minutes}min
                          </span>
                          {schedule.break_start && schedule.break_end && (
                            <span className="text-xs text-gray-500">
                              Descanso: {workScheduleService.formatTime(schedule.break_start)} - {workScheduleService.formatTime(schedule.break_end)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No configurado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {schedule ? (
                      <>
                        <button
                          onClick={() => setEditingDay(isEditing ? null : day.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700"
                        >
                          {isEditing ? "Cancelar" : "Editar"}
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCreateSchedule(day.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Configurar
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && schedule && (
                  <ScheduleEditForm
                    schedule={schedule}
                    onUpdate={(updates) => handleUpdateSchedule(schedule, updates)}
                    onCancel={() => setEditingDay(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ScheduleEditFormProps {
  schedule: WorkSchedule;
  onUpdate: (updates: any) => void;
  onCancel: () => void;
}

function ScheduleEditForm({ schedule, onUpdate, onCancel }: ScheduleEditFormProps) {
  const [formData, setFormData] = useState({
    start_time: workScheduleService.formatTime(schedule.start_time),
    end_time: workScheduleService.formatTime(schedule.end_time),
    slot_duration_minutes: schedule.slot_duration_minutes,
    break_start: schedule.break_start ? workScheduleService.formatTime(schedule.break_start) : "",
    break_end: schedule.break_end ? workScheduleService.formatTime(schedule.break_end) : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      start_time: formData.start_time,
      end_time: formData.end_time,
      slot_duration_minutes: formData.slot_duration_minutes,
      break_start: formData.break_start || null,
      break_end: formData.break_end || null,
    };

    onUpdate(updates);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hora de inicio
          </label>
          <input
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hora de fin
          </label>
          <input
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duración de slots (minutos)
          </label>
          <select
            value={formData.slot_duration_minutes}
            onChange={(e) => setFormData({...formData, slot_duration_minutes: parseInt(e.target.value)})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>60 minutos</option>
            <option value={90}>90 minutos</option>
            <option value={120}>120 minutos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descanso - Inicio (opcional)
          </label>
          <input
            type="time"
            value={formData.break_start}
            onChange={(e) => setFormData({...formData, break_start: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descanso - Fin (opcional)
          </label>
          <input
            type="time"
            value={formData.break_end}
            onChange={(e) => setFormData({...formData, break_end: e.target.value})}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}