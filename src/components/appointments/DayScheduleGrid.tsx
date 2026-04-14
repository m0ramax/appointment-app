import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import { appointmentService, type AppointmentWithParties } from "../../lib/api/appointments";
import { workScheduleService, type TeamMember, type WorkSchedule } from "../../lib/api/work-schedule";

// ── Constants ────────────────────────────────────────────────────────────────

const START_HOUR = 7;
const END_HOUR   = 21;
const HOUR_PX    = 64;

const BLOCK_COLORS = [
  { bg: "bg-blue-500/30 border-blue-400/60",     text: "text-blue-200" },
  { bg: "bg-green-500/30 border-green-400/60",   text: "text-green-200" },
  { bg: "bg-purple-500/30 border-purple-400/60", text: "text-purple-200" },
  { bg: "bg-amber-500/30 border-amber-400/60",   text: "text-amber-200" },
  { bg: "bg-rose-500/30 border-rose-400/60",     text: "text-rose-200" },
  { bg: "bg-teal-500/30 border-teal-400/60",     text: "text-teal-200" },
  { bg: "bg-indigo-500/30 border-indigo-400/60", text: "text-indigo-200" },
];

const MEMBER_COLORS = [
  "text-blue-400","text-green-400","text-purple-400","text-amber-400","text-rose-400",
];

const DAY_SHORT = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTH_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DAYS_EN: Record<number, string> = {
  0:"SUNDAY",1:"MONDAY",2:"TUESDAY",3:"WEDNESDAY",4:"THURSDAY",5:"FRIDAY",6:"SATURDAY",
};
const DAYS_ORDER = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const DAY_LABEL: Record<string,string> = {
  MONDAY:"Lun", TUESDAY:"Mar", WEDNESDAY:"Mié", THURSDAY:"Jue",
  FRIDAY:"Vie", SATURDAY:"Sáb", SUNDAY:"Dom",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function getMondayOfWeek(d: Date) {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  r.setHours(0,0,0,0);
  return r;
}
function apptTopPx(dt: string) {
  const d = new Date(dt);
  return ((d.getUTCHours() - START_HOUR) + d.getUTCMinutes() / 60) * HOUR_PX;
}
function apptHeightPx(min: number) { return Math.max((min / 60) * HOUR_PX, 20); }
function personName(email?: string, fallback?: string) {
  if (!email) return fallback ?? "—";
  const n = email.split("@")[0];
  return n.charAt(0).toUpperCase() + n.slice(1);
}
function formatTime(dt: string) {
  const d = new Date(dt);
  return `${d.getUTCHours().toString().padStart(2,"0")}:${d.getUTCMinutes().toString().padStart(2,"0")}`;
}

// ── ScheduleTable ─────────────────────────────────────────────────────────────
// Shows each member's working hours per day of the week as a compact table.

interface ScheduleTableProps {
  team: TeamMember[];
  schedules: Record<number, WorkSchedule[]>;
  userId: number | null;
}

function ScheduleTable({ team, schedules, userId }: ScheduleTableProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-pm-text">Horarios</h4>
      <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: "480px" }}>
            <thead>
              <tr className="border-b border-pm-border">
                <th className="py-2 px-3 text-left text-pm-muted font-medium w-28">Proveedor</th>
                {DAYS_ORDER.map(day => (
                  <th key={day} className="py-2 px-2 text-center text-pm-muted font-medium">
                    {DAY_LABEL[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.map((member, idx) => {
                const memberScheds = schedules[member.id] ?? [];
                return (
                  <tr key={member.id} className="border-b border-pm-border/40 last:border-0">
                    <td className="py-2 px-3">
                      <span className={`font-medium ${MEMBER_COLORS[idx % MEMBER_COLORS.length]}`}>
                        {personName(member.email)}
                        {member.id === userId ? " (tú)" : ""}
                      </span>
                    </td>
                    {DAYS_ORDER.map(day => {
                      const sched = memberScheds.find(s => s.dayOfWeek === day && s.isActive);
                      return (
                        <td key={day} className="py-2 px-2 text-center">
                          {sched ? (
                            <div className="space-y-0.5">
                              <div className="text-pm-text font-medium">
                                {sched.startTime}–{sched.endTime}
                              </div>
                              {sched.breakStart && sched.breakEnd && (
                                <div className="text-pm-dim text-[10px]">
                                  {sched.breakStart}–{sched.breakEnd}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-pm-border">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── WeekCalendar ──────────────────────────────────────────────────────────────
// Week grid with appointment blocks, no schedule overlays.

interface WeekCalendarProps {
  weekDays: Date[];
  weekStart: Date;
  weekEnd: Date;
  weekOffset: number;
  setWeekOffset: (fn: (n: number) => number) => void;
  appointments: AppointmentWithParties[];
  isOwner: boolean;
}

function WeekCalendar({
  weekDays, weekStart, weekEnd, weekOffset, setWeekOffset,
  appointments, isOwner,
}: WeekCalendarProps) {
  const today    = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  const todayStr = toLocalDateStr(today);

  const hours      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_PX;

  const now    = new Date();
  const nowTop = ((now.getHours() - START_HOUR) + now.getMinutes() / 60) * HOUR_PX;

  const apptColor = (id: number) => BLOCK_COLORS[id % BLOCK_COLORS.length];

  function apptsOnDay(ds: string) {
    return appointments.filter(a =>
      a.status !== "CANCELLED" &&
      toLocalDateStr(new Date(a.dateTime)) === ds
    );
  }

  return (
    <div className="space-y-2">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-pm-text">Citas</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-6 h-6 flex items-center justify-center rounded border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="text-xs text-pm-muted min-w-[150px] text-center">
            {weekStart.getDate()}/{weekStart.getMonth()+1} – {weekEnd.getDate()}/{weekEnd.getMonth()+1} · {MONTH_SHORT[weekStart.getMonth()]} {weekStart.getFullYear()}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-6 h-6 flex items-center justify-center rounded border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(() => 0)} className="text-xs text-pm-gold hover:text-pm-gold-light transition-colors">
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: "560px" }}>

            {/* Day headers */}
            <div className="flex border-b border-pm-border bg-pm-surface sticky top-0 z-30">
              <div className="w-12 flex-shrink-0" />
              {weekDays.map(d => {
                const ds    = toLocalDateStr(d);
                const isT   = ds === todayStr;
                const count = appointments.filter(a =>
                  a.status !== "CANCELLED" &&
                  toLocalDateStr(new Date(a.dateTime)) === ds
                ).length;
                return (
                  <div
                    key={ds}
                    className={`flex-1 py-2 text-center border-l border-pm-border/40 ${isT ? "bg-pm-gold/5" : ""}`}
                  >
                    <p className={`text-xs font-medium ${isT ? "text-pm-gold" : "text-pm-muted"}`}>
                      {DAY_SHORT[d.getDay()]}
                    </p>
                    <div className={`mx-auto mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                      ${isT ? "bg-pm-gold text-pm-bg" : "text-pm-text"}`}>
                      {d.getDate()}
                    </div>
                    {count > 0 && (
                      <div className="flex justify-center gap-0.5 mt-1">
                        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                          <span key={i} className="w-1 h-1 rounded-full bg-green-400" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time + event grid */}
            <div className="flex overflow-y-auto" style={{ maxHeight: "520px" }}>
              {/* Hour labels */}
              <div className="w-12 flex-shrink-0 relative bg-pm-surface" style={{ height: gridHeight }}>
                {hours.map(h => (
                  <div
                    key={h}
                    className="absolute w-full pr-2 text-right text-xs text-pm-dim select-none"
                    style={{ top: (h - START_HOUR) * HOUR_PX - 8 }}
                  >
                    {h.toString().padStart(2,"0")}:00
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map(d => {
                const ds       = toLocalDateStr(d);
                const isT      = ds === todayStr;
                const dayAppts = apptsOnDay(ds);

                return (
                  <div
                    key={ds}
                    className={`flex-1 border-l border-pm-border/40 relative ${isT ? "bg-pm-gold/[0.03]" : ""}`}
                    style={{ height: gridHeight }}
                  >
                    {hours.map(h => (
                      <div key={h} className="absolute w-full border-t border-pm-border/25" style={{ top: (h - START_HOUR) * HOUR_PX }} />
                    ))}
                    {hours.map(h => (
                      <div key={`${h}h`} className="absolute w-full border-t border-pm-border/10" style={{ top: (h - START_HOUR) * HOUR_PX + HOUR_PX / 2 }} />
                    ))}

                    {/* Now indicator */}
                    {isT && nowTop >= 0 && nowTop <= gridHeight && (
                      <div className="absolute w-full z-30 flex items-center" style={{ top: nowTop }}>
                        <div className="w-2 h-2 rounded-full bg-pm-gold flex-shrink-0 -ml-1" />
                        <div className="flex-1 h-px bg-pm-gold" />
                      </div>
                    )}

                    {/* Appointments */}
                    {dayAppts.map(appt => {
                      const color  = apptColor(appt.id);
                      const top    = apptTopPx(appt.dateTime);
                      const height = apptHeightPx(appt.durationMinutes);
                      const label  = personName(appt.client?.email, `Cliente #${appt.clientId}`);
                      const sub    = isOwner
                        ? personName(appt.provider?.email, `Prov. #${appt.providerId}`)
                        : appt.title;
                      return (
                        <div
                          key={appt.id}
                          className={`absolute left-0.5 right-0.5 rounded border px-1.5 py-1 z-20 overflow-hidden cursor-default ${color.bg}`}
                          style={{ top: top + 1, height: height - 2 }}
                          title={`${label} · ${appt.title} · ${appt.durationMinutes}min`}
                        >
                          <p className={`text-xs font-semibold leading-tight truncate ${color.text}`}>
                            {formatTime(appt.dateTime)} · {label}
                          </p>
                          {height >= 38 && (
                            <p className={`text-xs opacity-80 truncate ${color.text}`}>{sub}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-pm-dim">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-pm-gold rounded-full" />
          Ahora
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DayScheduleGrid() {
  const [role, setRole]     = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [team, setTeam]     = useState<TeamMember[]>([]);
  const [schedules, setSchedules] = useState<Record<number, WorkSchedule[]>>({});
  const [appointments, setAppointments] = useState<AppointmentWithParties[]>([]);
  const [loading, setLoading]   = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const todayInit = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const today     = todayInit();
  const isOwner   = role === "OWNER";

  const weekStart = addDays(getMondayOfWeek(today), weekOffset * 7);
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd   = addDays(weekStart, 6);

  // ── Init ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    authService.getProfile().then(async user => {
      if (!user) return;
      const r = user.role?.toUpperCase() ?? "";
      setRole(r);
      setUserId(user.id);

      if (r === "OWNER") {
        const members = await workScheduleService.getTeam();
        setTeam(members);
        const entries = await Promise.all(members.map(async m => {
          const s = await workScheduleService.getMyWorkSchedules(m.id !== user.id ? m.id : undefined);
          return [m.id, s] as [number, WorkSchedule[]];
        }));
        setSchedules(Object.fromEntries(entries));
      } else {
        setTeam([{ id: user.id, email: user.email, role: user.role }]);
        const s = await workScheduleService.getMyWorkSchedules();
        setSchedules({ [user.id]: s });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // ── Fetch appointments for the displayed week ────────────────────────────────

  useEffect(() => {
    if (loading || !role) return;
    const start = toLocalDateStr(weekStart);
    const end   = toLocalDateStr(weekEnd);

    if (isOwner) {
      appointmentService.getBusinessAppointmentsForWeek(start, end)
        .then(setAppointments)
        .catch(() => {});
    } else {
      appointmentService.getUserAppointments()
        .then(all => setAppointments(all as AppointmentWithParties[]))
        .catch(() => {});
    }
  }, [weekOffset, loading, role]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center gap-2 text-pm-muted text-sm py-6">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-pm-border border-t-pm-gold" />
      Cargando agenda...
    </div>
  );

  return (
    <div className="space-y-6">
      <ScheduleTable team={team} schedules={schedules} userId={userId} />
      <WeekCalendar
        weekDays={weekDays}
        weekStart={weekStart}
        weekEnd={weekEnd}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        appointments={appointments}
        isOwner={isOwner}
      />
    </div>
  );
}
