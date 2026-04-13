import { useState, useEffect } from "react";
import { workScheduleService, type WorkSchedule, type WorkScheduleCreate, type WorkScheduleUpdate, type TeamMember } from "../../lib/api/work-schedule";
import { authService } from "../../lib/api/auth";

interface WorkScheduleManagerProps {
  onScheduleUpdate?: () => void;
}

const DAYS_OF_WEEK = [
  { id: "MONDAY",    name: "Lunes" },
  { id: "TUESDAY",   name: "Martes" },
  { id: "WEDNESDAY", name: "Miércoles" },
  { id: "THURSDAY",  name: "Jueves" },
  { id: "FRIDAY",    name: "Viernes" },
  { id: "SATURDAY",  name: "Sábado" },
  { id: "SUNDAY",    name: "Domingo" },
];

export default function WorkScheduleManager({ onScheduleUpdate }: WorkScheduleManagerProps) {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [defaultSlotDuration, setDefaultSlotDuration] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  useEffect(() => {
    authService.getProfile().then(user => {
      if (!user) { setError("Error al obtener información del usuario"); setLoading(false); return; }
      const role = user.role?.toUpperCase();
      if (role !== "PROVIDER" && role !== "OWNER") {
        setError("No tienes permisos para gestionar horarios");
        setLoading(false);
        return;
      }
      setCurrentUserId(user.id);
      if (role === "OWNER") {
        setIsOwner(true);
        workScheduleService.getTeam().then(members => {
          setTeam(members);
          setSelectedProviderId(user.id);
        }).catch(() => {
          setSelectedProviderId(user.id);
        });
      } else {
        setSelectedProviderId(user.id);
      }
    }).catch(() => {
      setError("Error al obtener información del usuario");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedProviderId !== undefined) loadScheduleData();
  }, [selectedProviderId]);

  const forProvider = isOwner && selectedProviderId !== currentUserId ? selectedProviderId : undefined;

  const loadScheduleData = async () => {
    setLoading(true);
    setError("");
    setEditingDay(null);
    try {
      const [schedulesData, settingsData] = await Promise.all([
        workScheduleService.getMyWorkSchedules(forProvider),
        workScheduleService.getMySettings().catch(() => null),
      ]);
      setSchedules(schedulesData);
      if (settingsData?.defaultSlotDuration) setDefaultSlotDuration(settingsData.defaultSlotDuration);
    } catch {
      setError("Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (dayOfWeek: string) => {
    try {
      const newSchedule: WorkScheduleCreate = {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: defaultSlotDuration,
      };
      await workScheduleService.createWorkSchedule(newSchedule, forProvider);
      await loadScheduleData();
      onScheduleUpdate?.();
      setEditingDay(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear horario");
    }
  };

  const handleUpdateSchedule = async (schedule: WorkSchedule, updates: WorkScheduleUpdate) => {
    try {
      await workScheduleService.updateWorkSchedule(schedule.id, updates);
      await loadScheduleData();
      onScheduleUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar horario");
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este horario?")) return;
    try {
      await workScheduleService.deleteWorkSchedule(scheduleId);
      await loadScheduleData();
      onScheduleUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar horario");
    }
  };

  const getScheduleForDay = (dayOfWeek: string): WorkSchedule | null =>
    schedules.find(s => s.dayOfWeek === dayOfWeek && s.isActive) || null;

  const getMemberLabel = (m: TeamMember) => {
    const name = m.email.split("@")[0];
    const suffix = m.role === "OWNER" ? " (tú)" : "";
    return name.charAt(0).toUpperCase() + name.slice(1) + suffix;
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pm-border border-t-pm-gold mx-auto"></div>
        <p className="mt-4 text-pm-muted text-sm">Cargando horarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-pm-text">Horarios de Trabajo</h3>
        <button onClick={loadScheduleData} className="text-sm text-pm-muted hover:text-pm-gold transition-colors">
          Actualizar
        </button>
      </div>

      {/* Team selector for OWNER */}
      {isOwner && team.length > 0 && (
        <div className="bg-pm-surface border border-pm-border rounded-xl p-4">
          <label className="block text-xs font-medium text-pm-muted mb-2">Gestionando horario de</label>
          <div className="flex flex-wrap gap-2">
            {team.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedProviderId(member.id)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  selectedProviderId === member.id
                    ? "border-pm-gold bg-pm-gold-dim text-pm-gold"
                    : "border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-gold"
                }`}
              >
                {getMemberLabel(member)}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-pm-border">
          <h4 className="text-sm font-semibold text-pm-text">Configuración Semanal</h4>
        </div>

        <div className="divide-y divide-pm-border">
          {DAYS_OF_WEEK.map((day) => {
            const schedule = getScheduleForDay(day.id);
            const isEditing = editingDay === day.id;

            return (
              <div key={day.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <span className="text-sm font-medium text-pm-text w-20 flex-shrink-0">{day.name}</span>
                    {schedule ? (
                      <div className="flex items-center flex-wrap gap-3">
                        <span className="text-sm text-pm-muted">
                          {schedule.startTime} — {schedule.endTime}
                        </span>
                        <span className="text-xs text-pm-dim bg-pm-elevated px-2 py-0.5 rounded">
                          {schedule.slotDurationMinutes}min slots
                        </span>
                        {schedule.breakStart && schedule.breakEnd && (
                          <span className="text-xs text-pm-dim">
                            Descanso: {schedule.breakStart} — {schedule.breakEnd}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-pm-dim">No configurado</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                    {schedule ? (
                      <>
                        <button
                          onClick={() => setEditingDay(isEditing ? null : day.id)}
                          className="text-sm text-pm-gold hover:text-pm-gold-light transition-colors"
                        >
                          {isEditing ? "Cancelar" : "Editar"}
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Eliminar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCreateSchedule(day.id)}
                        className="text-sm text-pm-gold hover:text-pm-gold-light transition-colors"
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
  onUpdate: (updates: WorkScheduleUpdate) => void;
  onCancel: () => void;
}

function ScheduleEditForm({ schedule, onUpdate, onCancel }: ScheduleEditFormProps) {
  const [formData, setFormData] = useState({
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    slotDurationMinutes: schedule.slotDurationMinutes,
    breakStart: schedule.breakStart ?? "",
    breakEnd: schedule.breakEnd ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      startTime: formData.startTime,
      endTime: formData.endTime,
      slotDurationMinutes: formData.slotDurationMinutes,
      breakStart: formData.breakStart || undefined,
      breakEnd: formData.breakEnd || undefined,
    });
  };

  const inputClass = "mt-1 block w-full px-3 py-2 border border-pm-border rounded-lg bg-pm-bg text-pm-text text-sm focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors";
  const labelClass = "block text-xs font-medium text-pm-muted";

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-pm-elevated border border-pm-border rounded-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Hora de inicio</label>
          <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Hora de fin</label>
          <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Duración de slots</label>
          <select value={formData.slotDurationMinutes} onChange={(e) => setFormData({...formData, slotDurationMinutes: parseInt(e.target.value)})} className={inputClass}>
            <option value={15} className="bg-pm-elevated">15 min</option>
            <option value={30} className="bg-pm-elevated">30 min</option>
            <option value={45} className="bg-pm-elevated">45 min</option>
            <option value={60} className="bg-pm-elevated">60 min</option>
            <option value={90} className="bg-pm-elevated">90 min</option>
            <option value={120} className="bg-pm-elevated">120 min</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Descanso inicio (opcional)</label>
          <input type="time" value={formData.breakStart} onChange={(e) => setFormData({...formData, breakStart: e.target.value})} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Descanso fin (opcional)</label>
          <input type="time" value={formData.breakEnd} onChange={(e) => setFormData({...formData, breakEnd: e.target.value})} className={inputClass} />
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        <button
          type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-pm-muted border border-pm-border rounded-lg hover:border-pm-gold hover:text-pm-text transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light rounded-lg transition-colors"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
