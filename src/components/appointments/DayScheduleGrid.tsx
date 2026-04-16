import { useState, useEffect } from "react";
import { authService, apiClient } from "../../lib/api/auth";
import { appointmentService, type AppointmentWithParties } from "../../lib/api/appointments";
import { workScheduleService, type TeamMember, type WorkSchedule } from "../../lib/api/work-schedule";
import { PROVIDER_COLORS } from "../../lib/providerColors";
import { layoutAppointments } from "../../lib/layout";

// ── Constants ────────────────────────────────────────────────────────────────

const START_HOUR = 7;
const END_HOUR   = 21;
const HOUR_PX    = 64;

// PENDING gets bright yellow in owner view — unmistakably different from any provider color
const PENDING_STYLE = {
  bg: "bg-yellow-300/40", border: "border-yellow-400 border-dashed",
  text: "text-yellow-900 dark:text-yellow-100", label: "text-yellow-700 dark:text-yellow-300",
};

// Status modifier for non-pending states
const STATUS_MODIFIER: Record<string, string> = {
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

// ── Popup helpers ─────────────────────────────────────────────────────────────

function statusLabel(status: string) {
  switch (status) {
    case "PENDING":   return "Pendiente";
    case "CONFIRMED": return "Confirmada";
    case "COMPLETED": return "Completada";
    case "CANCELLED": return "Cancelada";
    default:          return status;
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "PENDING":   return "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300";
    case "CONFIRMED": return "bg-blue-400/20 text-blue-700 dark:text-blue-300";
    case "COMPLETED": return "bg-green-400/20 text-green-700 dark:text-green-300";
    case "CANCELLED": return "bg-pm-border/30 text-pm-muted";
    default:          return "bg-pm-border/30 text-pm-muted";
  }
}

function ActionIcon({ actionKey }: { actionKey: string }) {
  if (actionKey === "confirm") {
    return (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (actionKey === "complete") {
    return (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (actionKey === "cancel") {
    return (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (actionKey === "delete") {
    return (
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    );
  }
  return null;
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
  allAppointments: AppointmentWithParties[];
  isOwner: boolean;
  role: string;
  team: TeamMember[];
  pendingOutsideWeek: number;
  onRefresh: () => void;
}

function WeekCalendar({
  weekDays, weekStart, weekEnd, weekOffset, setWeekOffset,
  appointments, allAppointments, isOwner, role, team, pendingOutsideWeek, onRefresh,
}: WeekCalendarProps) {
  const today    = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  const todayStr = toLocalDateStr(today);

  const hours      = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  const gridHeight = (END_HOUR - START_HOUR) * HOUR_PX;

  const now    = new Date();
  const nowTop = ((now.getHours() - START_HOUR) + now.getMinutes() / 60) * HOUR_PX;

  const [popup, setPopup] = useState<{
    appt: AppointmentWithParties;
    x: number;
    y: number;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [popupError, setPopupError] = useState<string>("");

  // Close popup when user scrolls anywhere
  useEffect(() => {
    if (!popup) return;
    const close = () => setPopup(null);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [!!popup]);

  async function handleAction(action: "confirm" | "complete" | "cancel" | "delete") {
    if (!popup || actionLoading) return;
    setActionLoading(true);
    setPopupError("");
    try {
      const id = popup.appt.id;
      if (action === "confirm")  await appointmentService.confirmAppointment(id);
      if (action === "complete") await appointmentService.completeAppointment(id);
      if (action === "cancel")   await appointmentService.cancelAppointment(id);
      if (action === "delete")   await appointmentService.deleteAppointment(id);
      setPopup(null);
      onRefresh();
      window.dispatchEvent(new CustomEvent("appointment-updated"));
    } catch (e: any) {
      setPopupError(e?.response?.data?.message || "Error al procesar la acción");
    } finally {
      setActionLoading(false);
    }
  }

  function getActions(appt: AppointmentWithParties): Array<{
    key: "confirm" | "complete" | "cancel" | "delete";
    label: string;
    danger?: boolean;
  }> {
    const isPast = new Date(appt.dateTime) < new Date();
    const { status } = appt;
    const actions: Array<{ key: "confirm" | "complete" | "cancel" | "delete"; label: string; danger?: boolean }> = [];

    if (isOwner) {
      if (status === "PENDING")   actions.push({ key: "confirm",  label: "Confirmar" });
      if (status === "CONFIRMED") actions.push({ key: "complete", label: "Completar" });
      if (status !== "COMPLETED" && status !== "CANCELLED")
        actions.push({ key: "cancel", label: "Cancelar", danger: true });
      actions.push({ key: "delete", label: "Eliminar", danger: true });
    } else {
      // Provider
      if (status === "PENDING")
        actions.push({ key: "confirm", label: "Confirmar" });
      if (status === "CONFIRMED" && isPast)
        actions.push({ key: "complete", label: "Completar" });
      if (status === "PENDING" || status === "CONFIRMED")
        actions.push({ key: "cancel", label: "Cancelar", danger: true });
    }
    return actions;
  }

  const providerColorIdx = (providerId: number) => {
    const idx = team.findIndex(m => m.id === providerId);
    return idx >= 0 ? idx : 0;
  };
  const apptStyle = (appt: AppointmentWithParties) => {
    // PENDING in owner view: amber override so "needs action" is immediately obvious
    if (isOwner && appt.status === "PENDING") {
      return { color: PENDING_STYLE, modifier: "" };
    }
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

  return (
    <div className="space-y-2">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-pm-text">Citas</h4>
          {pendingOutsideWeek > 0 && (
            <button
              onClick={() => {
                const weekStartStr = toLocalDateStr(weekStart);
                const weekEndStr   = toLocalDateStr(weekEnd);
                const nearest = allAppointments
                  .filter(a => {
                    if (a.status !== "PENDING") return false;
                    const ds = toLocalDateStr(new Date(a.dateTime));
                    return ds < weekStartStr || ds > weekEndStr;
                  })
                  .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];
                if (!nearest) return;
                const targetMonday = getMondayOfWeek(new Date(nearest.dateTime));
                const currentMonday = getMondayOfWeek(today);
                const diffDays = Math.round((targetMonday.getTime() - currentMonday.getTime()) / 86400000);
                setWeekOffset(() => Math.round(diffDays / 7));
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l3 3"/>
              </svg>
              {pendingOutsideWeek} pendiente{pendingOutsideWeek > 1 ? "s" : ""} fuera de esta semana
            </button>
          )}
        </div>
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

      {/* Grid — single scroll container so header and columns share the same width */}
      <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: "560px" }}>

            {/* ONE scrollable container: header is sticky inside it, so both header
                and grid columns account for the same scrollbar width → no misalignment */}
            <div className="overflow-y-auto" style={{ maxHeight: "580px" }}>

              {/* Sticky header row */}
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

              {/* Grid content row: time labels + day columns */}
              <div className="flex" style={{ height: gridHeight }}>
              {/* Hour labels */}
              <div className="w-12 flex-shrink-0 relative bg-pm-surface z-10" style={{ height: gridHeight }}>
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

              {/* Day columns wrapper — grid lines live here as a single overlay */}
              <div className="flex-1 relative" style={{ height: gridHeight }}>
                {/* Hour lines overlay — spans all columns, perfectly aligned */}
                <div className="absolute inset-0 pointer-events-none">
                  {hours.map(h => (
                    <div key={h} className="absolute w-full border-t border-pm-border/25" style={{ top: (h - START_HOUR) * HOUR_PX }} />
                  ))}
                  {hours.map(h => (
                    <div key={`${h}h`} className="absolute w-full border-t border-pm-border/10" style={{ top: (h - START_HOUR) * HOUR_PX + HOUR_PX / 2 }} />
                  ))}
                </div>

                {/* Day columns */}
                <div className="flex h-full">
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
                        const hasActions = getActions(appt).length > 0;
                        return (
                          <div
                            key={appt.id}
                            className={`absolute rounded border px-1.5 py-1 z-20 overflow-hidden
                              ${hasActions ? "cursor-pointer" : "cursor-default"}
                              ${color.bg} ${color.border} ${modifier}`}
                            style={{
                              top:    top + 1,
                              height: height - 2,
                              left:   `calc(${col * pct}% + 2px)`,
                              width:  `calc(${pct}% - 4px)`,
                            }}
                            title={`${label} · ${appt.title} · ${appt.durationMinutes}min`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const actions = getActions(appt);
                              if (actions.length === 0) return;
                              setPopup({ appt, x: e.clientX, y: e.clientY });
                            }}
                          >
                            <p className={`text-xs font-semibold leading-tight truncate flex items-center gap-1 ${color.text}`}>
                              {isOwner && (
                                <span className="flex-shrink-0 opacity-90" title={appt.status}>
                                  {appt.status === "PENDING"   && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l3 3"/></svg>}
                                  {appt.status === "CONFIRMED" && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                                  {appt.status === "COMPLETED" && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                </span>
                              )}
                              <span className="truncate">{formatTime(appt.dateTime)} · {label}</span>
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
                </div>{/* flex h-full day columns */}
              </div>{/* flex-1 relative wrapper */}
              </div>{/* flex grid content row */}
            </div>{/* overflow-y-auto */}
          </div>{/* minWidth */}
        </div>{/* overflow-x-auto */}
      </div>{/* rounded-xl */}

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

      {/* Popup */}
      {popup && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[60]" onClick={() => setPopup(null)} />
          {/* Menu */}
          <div
            className="fixed z-[61] bg-pm-surface border border-pm-border rounded-xl shadow-xl overflow-hidden w-52"
            onClick={(e) => e.stopPropagation()}
            style={{
              left: Math.min(popup.x, window.innerWidth - 220),
              top:  Math.min(popup.y, window.innerHeight - 200),
            }}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-pm-border/60">
              <p className="text-xs font-semibold text-pm-text truncate">
                {formatTime(popup.appt.dateTime)} · {personName(popup.appt.client?.email, `Cliente #${popup.appt.clientId}`)}
              </p>
              <p className="text-xs text-pm-muted truncate">{popup.appt.title}</p>
              <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadgeClass(popup.appt.status)}`}>
                {statusLabel(popup.appt.status)}
              </span>
            </div>
            {/* Actions */}
            <div className="py-1">
              {getActions(popup.appt).map(action => (
                <button
                  key={action.key}
                  disabled={actionLoading}
                  onClick={() => handleAction(action.key)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors disabled:opacity-50
                    ${action.danger ? "text-red-400 hover:bg-red-500/10" : "text-pm-text hover:bg-pm-border/30"}`}
                >
                  {actionLoading ? (
                    <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <ActionIcon actionKey={action.key} />
                  )}
                  {action.label}
                </button>
              ))}
            </div>
            {popupError && (
              <p className="px-3 py-2 text-xs text-red-400 border-t border-pm-border/60">{popupError}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DayScheduleGrid() {
  const [role, setRole]     = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [team, setTeam]     = useState<TeamMember[]>([]);
  const [teamMode, setTeamMode] = useState(false);
  const [schedules, setSchedules] = useState<Record<number, WorkSchedule[]>>({});
  const [appointments, setAppointments] = useState<AppointmentWithParties[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentWithParties[]>([]);
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
        // Check teamMode before loading team
        let isTeamMode = false;
        if (user.businessId) {
          try {
            const bizRes = await apiClient.get<{ teamMode?: boolean }>(`/business/${user.businessId}`);
            isTeamMode = bizRes.data.teamMode === true;
          } catch {}
        }
        setTeamMode(isTeamMode);

        const allMembers = await workScheduleService.getTeam();
        // In solo mode, only show the owner
        const members = isTeamMode ? allMembers : allMembers.filter(m => m.id === user.id);
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
      // Fetch all appointments (wide range) to detect pending outside current week
      appointmentService.getBusinessAppointmentsForWeek("2020-01-01", "2099-12-31")
        .then(setAllAppointments)
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

  const weekStartStr = toLocalDateStr(weekStart);
  const weekEndStr   = toLocalDateStr(weekEnd);
  const pendingOutsideWeek = isOwner
    ? allAppointments.filter(a => {
        if (a.status !== "PENDING") return false;
        const ds = toLocalDateStr(new Date(a.dateTime));
        return ds < weekStartStr || ds > weekEndStr;
      }).length
    : 0;

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
        allAppointments={allAppointments}
        isOwner={isOwner}
        role={role}
        team={team}
        pendingOutsideWeek={pendingOutsideWeek}
        onRefresh={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}
