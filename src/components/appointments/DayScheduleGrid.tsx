import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import { appointmentService, type AppointmentWithParties } from "../../lib/api/appointments";
import { workScheduleService, type TeamMember, type WorkSchedule } from "../../lib/api/work-schedule";
import { PROVIDER_COLORS } from "../../lib/providerColors";

// ── Constants ────────────────────────────────────────────────────────────────

const START_HOUR = 7;
const END_HOUR   = 21;
const HOUR_PX    = 64;

// Status is communicated via border style + opacity modifier
const STATUS_MODIFIER: Record<string, string> = {
  PENDING:   "border-dashed opacity-75",
  CONFIRMED: "",
  COMPLETED: "opacity-50",
  CANCELLED: "opacity-30",
};

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
  return ((d.getHours() - START_HOUR) + d.getMinutes() / 60) * HOUR_PX;
}
function apptHeightPx(min: number) { return Math.max((min / 60) * HOUR_PX, 20); }
function personName(email?: string, fallback?: string) {
  if (!email) return fallback ?? "—";
  const n = email.split("@")[0];
  return n.charAt(0).toUpperCase() + n.slice(1);
}
function formatTime(dt: string) {
  const d = new Date(dt);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
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
                      <span className={`font-medium ${PROVIDER_COLORS[idx % PROVIDER_COLORS.length].label}`}>
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
  team: TeamMember[];
}

function WeekCalendar({
  weekDays, weekStart, weekEnd, weekOffset, setWeekOffset,
  appointments, isOwner, team,
}: WeekCalendarProps) {
  const today    = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  const todayStr = toLocalDateStr(today);

  const hours      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_PX;

  const now    = new Date();
  const nowTop = ((now.getHours() - START_HOUR) + now.getMinutes() / 60) * HOUR_PX;

  const providerColorIdx = (providerId: number) => {
    const idx = team.findIndex(m => m.id === providerId);
    return idx >= 0 ? idx : 0;
  };
  const apptStyle = (appt: AppointmentWithParties) => {
    const color    = PROVIDER_COLORS[providerColorIdx(appt.providerId) % PROVIDER_COLORS.length];
    const modifier = STATUS_MODIFIER[appt.status] ?? "";
    return { color, modifier };
  };

  function apptsOnDay(ds: string) {
    return appointments.filter(a =>
      a.status !== "CANCELLED" &&
      toLocalDateStr(new Date(a.dateTime)) === ds
    );
  }

  // Assigns a column index and total-columns count to each appointment so
  // overlapping ones are displayed side by side instead of stacked.
  function layoutAppointments(appts: AppointmentWithParties[]) {
    const sorted = [...appts].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
    const colOf   = new Map<number, number>();
    const endMs   = new Map<number, number>();
    const columns: AppointmentWithParties[][] = [];

    for (const appt of sorted) {
      const start = new Date(appt.dateTime).getTime();
      const end   = start + appt.durationMinutes * 60_000;
      endMs.set(appt.id, end);

      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        const last    = columns[c][columns[c].length - 1];
        if ((endMs.get(last.id) ?? 0) <= start) {
          columns[c].push(appt);
          colOf.set(appt.id, c);
          placed = true;
          break;
        }
      }
      if (!placed) {
        colOf.set(appt.id, columns.length);
        columns.push([appt]);
      }
    }

    // For each appointment, the total columns = max column index among all
    // appointments that overlap with it, plus 1.
    const totalOf = new Map<number, number>();
    for (const appt of sorted) {
      const start = new Date(appt.dateTime).getTime();
      const end   = endMs.get(appt.id)!;
      let maxCol  = colOf.get(appt.id)!;
      for (const other of sorted) {
        if (other.id === appt.id) continue;
        const os = new Date(other.dateTime).getTime();
        const oe = endMs.get(other.id)!;
        if (start < oe && end > os) maxCol = Math.max(maxCol, colOf.get(other.id)!);
      }
      totalOf.set(appt.id, maxCol + 1);
    }

    return { colOf, totalOf };
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
                      <div className="mt-1 text-[10px] font-medium text-pm-muted leading-none">
                        {count} {count === 1 ? "cita" : "citas"}
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
                    {(() => {
                      const { colOf, totalOf } = layoutAppointments(dayAppts);
                      return dayAppts.map(appt => {
                        const { color, modifier } = apptStyle(appt);
                        const top    = apptTopPx(appt.dateTime);
                        const height = apptHeightPx(appt.durationMinutes);
                        const label  = personName(appt.client?.email, `Cliente #${appt.clientId}`);
                        const sub    = isOwner
                          ? personName(appt.provider?.email, `Prov. #${appt.providerId}`)
                          : appt.title;
                        const col    = colOf.get(appt.id) ?? 0;
                        const total  = totalOf.get(appt.id) ?? 1;
                        const pct    = 100 / total;
                        return (
                          <div
                            key={appt.id}
                            className={`absolute rounded border px-1.5 py-1 z-20 overflow-hidden cursor-default ${color.bg} ${color.border} ${modifier}`}
                            style={{
                              top:    top + 1,
                              height: height - 2,
                              left:   `calc(${col * pct}% + 2px)`,
                              width:  `calc(${pct}% - 4px)`,
                            }}
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
                      });
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-pm-dim">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-pm-gold rounded-full" />
          Ahora
        </span>
        {team.map((member, idx) => {
          const color = PROVIDER_COLORS[idx % PROVIDER_COLORS.length];
          return (
            <span key={member.id} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${color.bg} border ${color.border}`} />
              <span className={color.label}>{personName(member.email)}</span>
            </span>
          );
        })}
        <span className="flex items-center gap-1.5 ml-2 border-l border-pm-border/40 pl-2">
          <span className="w-3 h-3 rounded-sm border border-dashed border-pm-muted/60 opacity-75" /> Pendiente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-pm-muted/60" /> Confirmada
        </span>
        <span className="flex items-center gap-1.5 opacity-50">
          <span className="w-3 h-3 rounded-sm border border-pm-muted/60" /> Completada
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
  const [refreshKey, setRefreshKey] = useState(0);

  const todayInit = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const today     = todayInit();
  const isOwner   = role === "OWNER";

  const weekStart = addDays(getMondayOfWeek(today), weekOffset * 7);
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd   = addDays(weekStart, 6);

  // ── Listen for status updates from AppointmentList ──────────────────────────

  useEffect(() => {
    const handler = () => setRefreshKey(k => k + 1);
    window.addEventListener("appointment-updated", handler);
    return () => window.removeEventListener("appointment-updated", handler);
  }, []);

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
  }, [weekOffset, loading, role, refreshKey]);

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
        team={team}
      />
    </div>
  );
}
