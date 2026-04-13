import { useState, useEffect, useCallback } from "react";
import { workScheduleService, type WorkSchedule, type WorkScheduleCreate, type TeamMember } from "../../lib/api/work-schedule";
import { authService } from "../../lib/api/auth";

const DAYS = [
  { id: "MONDAY",    short: "Lun", jsDay: 1 },
  { id: "TUESDAY",   short: "Mar", jsDay: 2 },
  { id: "WEDNESDAY", short: "Mié", jsDay: 3 },
  { id: "THURSDAY",  short: "Jue", jsDay: 4 },
  { id: "FRIDAY",    short: "Vie", jsDay: 5 },
  { id: "SATURDAY",  short: "Sáb", jsDay: 6 },
  { id: "SUNDAY",    short: "Dom", jsDay: 0 },
];

const HOURS: string[] = [];
for (let h = 7; h <= 21; h++) {
  HOURS.push(`${h.toString().padStart(2, "0")}:00`);
}

const MEMBER_COLORS = [
  { dot: "bg-blue-500",   bg: "bg-blue-500/20",   border: "border-blue-500/50",   text: "text-blue-400" },
  { dot: "bg-green-500",  bg: "bg-green-500/20",   border: "border-green-500/50",   text: "text-green-400" },
  { dot: "bg-purple-500", bg: "bg-purple-500/20",  border: "border-purple-500/50",  text: "text-purple-400" },
  { dot: "bg-amber-500",  bg: "bg-amber-500/20",   border: "border-amber-500/50",   text: "text-amber-400" },
  { dot: "bg-rose-500",   bg: "bg-rose-500/20",    border: "border-rose-500/50",    text: "text-rose-400" },
];

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(n: number) {
  return `${Math.floor(n / 60).toString().padStart(2, "0")}:${(n % 60).toString().padStart(2, "0")}`;
}

/** Returns the Monday of the week containing `date` */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Add days to a date */
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Format as "14/04" */
function formatShortDate(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

/** Format month/year for header: "Abr 2025" */
function formatMonthYear(date: Date): string {
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

interface ActiveSlot {
  memberId: number;
  colorIdx: number;
  scheduleId: number;
}

interface ModalState {
  day: string;
  hour: string;
  date: Date;
  active: ActiveSlot[];
}

export default function TeamScheduleGrid() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [schedulesByMember, setSchedulesByMember] = useState<Record<number, WorkSchedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = addDays(getMondayOfWeek(today), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);

  // Date for each column (Mon=0 … Sun=6)
  const colDates = DAYS.map((_, i) => addDays(weekStart, i));

  useEffect(() => { init(); }, []);

  async function init() {
    setLoading(true);
    try {
      const user = await authService.getProfile();
      if (!user) return;
      setCurrentUserId(user.id);

      const members = await workScheduleService.getTeam();
      setTeam(members);

      const entries = await Promise.all(
        members.map(async (m) => {
          const forProvider = m.id !== user.id ? m.id : undefined;
          const schedules = await workScheduleService.getMyWorkSchedules(forProvider);
          return [m.id, schedules] as [number, WorkSchedule[]];
        })
      );
      setSchedulesByMember(Object.fromEntries(entries));
    } catch {
      setError("Error al cargar los horarios del equipo");
    } finally {
      setLoading(false);
    }
  }

  const getActiveSlots = useCallback((day: string, hour: string): ActiveSlot[] => {
    const hourMin = timeToMinutes(hour);
    const result: ActiveSlot[] = [];
    for (let i = 0; i < team.length; i++) {
      const member = team[i];
      const schedules = schedulesByMember[member.id] ?? [];
      const schedule = schedules.find(s => s.dayOfWeek === day && s.isActive);
      if (!schedule) continue;
      const start = timeToMinutes(schedule.startTime);
      const end = timeToMinutes(schedule.endTime);
      const bStartStr = schedule.breakStart && schedule.breakStart.trim() !== "" ? schedule.breakStart : null;
      const bEndStr = schedule.breakEnd && schedule.breakEnd.trim() !== "" ? schedule.breakEnd : null;
      const bStart = bStartStr ? timeToMinutes(bStartStr) : null;
      const bEnd = bEndStr ? timeToMinutes(bEndStr) : null;
      if (hourMin >= start && hourMin < end) {
        if (bStart !== null && bEnd !== null && hourMin >= bStart && hourMin < bEnd) continue;
        result.push({ memberId: member.id, colorIdx: i % MEMBER_COLORS.length, scheduleId: schedule.id });
      }
    }
    return result;
  }, [team, schedulesByMember]);

  function openModal(day: string, hour: string, date: Date) {
    setModal({ day, hour, date, active: getActiveSlots(day, hour) });
  }

  async function handleToggle(memberId: number) {
    if (!modal || saving) return;
    setSaving(true);
    const { day, hour } = modal;
    const hourMin = timeToMinutes(hour);
    const isActive = modal.active.some(s => s.memberId === memberId);
    const forProvider = memberId !== currentUserId ? memberId : undefined;

    try {
      if (isActive) {
        const schedules = schedulesByMember[memberId] ?? [];
        const schedule = schedules.find(s => s.dayOfWeek === day && s.isActive);
        if (schedule) {
          const start = timeToMinutes(schedule.startTime);
          const end = timeToMinutes(schedule.endTime);
          if (hourMin === start && end > hourMin + 60) {
            await workScheduleService.updateWorkSchedule(schedule.id, { startTime: minutesToTime(hourMin + 60) });
          } else if (hourMin + 60 >= end && hourMin > start) {
            await workScheduleService.updateWorkSchedule(schedule.id, { endTime: minutesToTime(hourMin) });
          } else if (start === hourMin && end === hourMin + 60) {
            await workScheduleService.deleteWorkSchedule(schedule.id);
          }
        }
      } else {
        const schedules = schedulesByMember[memberId] ?? [];
        const existing = schedules.find(s => s.dayOfWeek === day && s.isActive);
        if (existing) {
          const newStart = Math.min(timeToMinutes(existing.startTime), hourMin);
          const newEnd = Math.max(timeToMinutes(existing.endTime), hourMin + 60);
          await workScheduleService.updateWorkSchedule(existing.id, {
            startTime: minutesToTime(newStart),
            endTime: minutesToTime(newEnd),
          });
        } else {
          const newSchedule: WorkScheduleCreate = {
            dayOfWeek: day,
            startTime: minutesToTime(hourMin),
            endTime: minutesToTime(Math.min(hourMin + 60, 22 * 60)),
            slotDurationMinutes: 30,
          };
          await workScheduleService.createWorkSchedule(newSchedule, forProvider);
        }
      }

      await init();
      setModal(prev => prev ? { ...prev, active: getActiveSlots(prev.day, prev.hour) } : null);
    } catch {
      setError("Error al actualizar el horario");
    } finally {
      setSaving(false);
    }
  }

  const getMemberName = (id: number) => {
    const m = team.find(t => t.id === id);
    if (!m) return "";
    const name = m.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (loading) return (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-pm-border border-t-pm-gold mx-auto"></div>
      <p className="mt-4 text-pm-muted text-sm">Cargando horarios del equipo...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
  );

  return (
    <div className="space-y-4">
      {/* Legend + week navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {team.map((m, i) => (
            <div key={m.id} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${MEMBER_COLORS[i % MEMBER_COLORS.length].dot}`}></div>
              <span className="text-xs text-pm-muted">{getMemberName(m.id)}{m.id === currentUserId ? " (tú)" : ""}</span>
            </div>
          ))}
        </div>

        {/* Week navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span className="text-xs text-pm-muted min-w-[120px] text-center">
            {formatShortDate(weekStart)} – {formatShortDate(weekEnd)} · {formatMonthYear(weekStart)}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-pm-gold hover:text-pm-gold-light transition-colors ml-1"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs border-collapse">
            <thead>
              <tr className="border-b border-pm-border">
                <th className="w-14 px-3 py-3 text-pm-dim font-normal"></th>
                {DAYS.map((d, i) => {
                  const date = colDates[i];
                  const todayCol = isToday(date);
                  return (
                    <th key={d.id} className={`px-2 py-2 text-center font-semibold ${todayCol ? "text-pm-gold" : "text-pm-muted"}`}>
                      <div>{d.short}</div>
                      <div className={`text-xs font-normal mt-0.5 ${todayCol ? "text-pm-gold" : "text-pm-dim"}`}>
                        {formatShortDate(date)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="border-t border-pm-border/40">
                  <td className="px-3 py-0.5 text-pm-dim text-right text-xs w-14 align-middle">{hour}</td>
                  {DAYS.map((day, i) => {
                    const slots = getActiveSlots(day.id, hour);
                    const todayCol = isToday(colDates[i]);
                    return (
                      <td key={day.id} className={`px-1 py-0.5 ${todayCol ? "bg-pm-gold/5" : ""}`}>
                        <button
                          onClick={() => openModal(day.id, hour, colDates[i])}
                          className={`w-full h-7 rounded border transition-all flex items-center justify-center gap-0.5 px-1
                            ${slots.length > 0
                              ? "border-pm-border/60 bg-pm-elevated/60 hover:opacity-80"
                              : "border-pm-border/20 hover:bg-pm-elevated/40 hover:border-pm-gold/30"
                            }`}
                          title={slots.length > 0
                            ? slots.map(s => getMemberName(s.memberId)).join(", ")
                            : "Sin asignar — clic para asignar"
                          }
                        >
                          {slots.length > 0
                            ? slots.map(s => (
                                <div
                                  key={s.memberId}
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${MEMBER_COLORS[s.colorIdx].dot}`}
                                />
                              ))
                            : <span className="text-pm-border/60 text-xs">+</span>
                          }
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setModal(null)}>
          <div className="bg-pm-surface border border-pm-border rounded-2xl p-6 w-80 shadow-premium" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-pm-text mb-0.5">
              {DAYS.find(d => d.id === modal.day)?.short} {formatShortDate(modal.date)} — {modal.hour}
            </h3>
            <p className="text-xs text-pm-muted mb-4">Selecciona quién trabaja en este bloque</p>

            <div className="space-y-2">
              {team.map((m, i) => {
                const color = MEMBER_COLORS[i % MEMBER_COLORS.length];
                const isActive = modal.active.some(s => s.memberId === m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => handleToggle(m.id)}
                    disabled={saving}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left disabled:opacity-50
                      ${isActive
                        ? `${color.bg} ${color.border} ${color.text}`
                        : "border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text"
                      }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`}></div>
                    <span className="text-sm font-medium flex-1">
                      {getMemberName(m.id)}{m.id === currentUserId ? " (tú)" : ""}
                    </span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all
                      ${isActive ? `${color.dot} border-transparent` : "border-pm-border"}`}>
                      {isActive && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>

            {saving && <p className="text-xs text-pm-muted text-center mt-3">Guardando...</p>}

            <button
              onClick={() => setModal(null)}
              className="mt-4 w-full py-2 text-sm text-pm-muted border border-pm-border rounded-lg hover:border-pm-gold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
