import { useState, useEffect } from "react";
import { workScheduleService, type WorkSchedule } from "../../lib/api/work-schedule";
import { appointmentService, type Appointment } from "../../lib/api/appointments";

const DAYS = [
  { id: "MONDAY",    name: "Lunes",      jsDay: 1 },
  { id: "TUESDAY",   name: "Martes",     jsDay: 2 },
  { id: "WEDNESDAY", name: "Miércoles",  jsDay: 3 },
  { id: "THURSDAY",  name: "Jueves",     jsDay: 4 },
  { id: "FRIDAY",    name: "Viernes",    jsDay: 5 },
  { id: "SATURDAY",  name: "Sábado",     jsDay: 6 },
  { id: "SUNDAY",    name: "Domingo",    jsDay: 0 },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-400/15 border-yellow-400/40 text-yellow-400",
  CONFIRMED: "bg-green-400/15 border-green-400/40 text-green-400",
  COMPLETED: "bg-blue-400/15 border-blue-400/40 text-blue-400",
  CANCELLED: "bg-red-400/15 border-red-400/40 text-red-400 line-through opacity-60",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmada",
  COMPLETED: "Completada", CANCELLED: "Cancelada",
};

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}

function formatMonthYear(date: Date): string {
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getUTCHours().toString().padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}`;
}

function clientName(appt: Appointment): string {
  if (appt.client?.email) {
    const name = appt.client.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return `Cliente #${appt.clientId}`;
}

export default function MyWeeklySchedule() {
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = addDays(getMondayOfWeek(today), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);
  weekEnd.setHours(23, 59, 59, 999);

  useEffect(() => {
    Promise.all([
      workScheduleService.getMyWorkSchedules(),
      appointmentService.getUserAppointments(),
    ])
      .then(([s, a]) => { setSchedules(s); setAppointments(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Appointments for a given day (Date object)
  function apptForDay(date: Date): Appointment[] {
    return appointments
      .filter(a => {
        if (a.status === "CANCELLED") return false;
        const d = new Date(a.dateTime);
        return (
          d.getUTCFullYear() === date.getFullYear() &&
          d.getUTCMonth() === date.getMonth() &&
          d.getUTCDate() === date.getDate()
        );
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-pm-muted text-sm py-4">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-pm-border border-t-pm-gold"></div>
      Cargando horario...
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header + week navigator */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-pm-text">Mi Semana</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-6 h-6 flex items-center justify-center rounded border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span className="text-xs text-pm-muted">
            {formatDate(weekStart)} – {formatDate(weekEnd)} · {formatMonthYear(weekStart)}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-6 h-6 flex items-center justify-center rounded border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-pm-gold hover:text-pm-gold-light transition-colors">
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* Days */}
      <div className="divide-y divide-pm-border border border-pm-border rounded-xl overflow-hidden">
        {DAYS.map((day, i) => {
          const colDate = addDays(weekStart, i);
          const schedule = schedules.find(s => s.dayOfWeek === day.id && s.isActive);
          const dayAppts = apptForDay(colDate);
          const isToday =
            colDate.getFullYear() === today.getFullYear() &&
            colDate.getMonth() === today.getMonth() &&
            colDate.getDate() === today.getDate();

          return (
            <div key={day.id} className={`px-4 py-3 ${isToday ? "bg-pm-gold/5" : "bg-pm-surface"}`}>
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${isToday ? "text-pm-gold" : "text-pm-text"}`}>
                    {day.name}
                    {isToday && <span className="ml-1.5 text-xs font-normal text-pm-gold/70">hoy</span>}
                  </p>
                  <span className={`text-xs ${isToday ? "text-pm-gold/60" : "text-pm-dim"}`}>{formatDate(colDate)}</span>
                </div>
                {schedule ? (
                  <span className="text-xs text-pm-muted">
                    {schedule.startTime} – {schedule.endTime}
                    {schedule.breakStart && schedule.breakEnd && (
                      <span className="text-pm-dim"> · Descanso {schedule.breakStart}–{schedule.breakEnd}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs text-pm-dim">Libre</span>
                )}
              </div>

              {/* Appointments */}
              {dayAppts.length > 0 ? (
                <div className="space-y-1.5 mt-2">
                  {dayAppts.map(appt => (
                    <div
                      key={appt.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${STATUS_STYLES[appt.status] ?? ""}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold flex-shrink-0">{formatTime(appt.dateTime)}</span>
                        <span className="font-medium truncate">{clientName(appt)}</span>
                        {appt.title && appt.title !== clientName(appt) && (
                          <span className="truncate opacity-70">· {appt.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="opacity-70">{appt.durationMinutes}min</span>
                        <span className="opacity-70">{STATUS_LABEL[appt.status]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : schedule ? (
                <p className="text-xs text-pm-dim mt-1">Sin citas</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
