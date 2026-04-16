import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { workScheduleService, type WorkSchedule, type WorkScheduleCreate, type TeamMember } from "../../lib/api/work-schedule";
import { authService } from "../../lib/api/auth";

// ── Constants ────────────────────────────────────────────────────────────────

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
for (let h = 7; h <= 21; h++) HOURS.push(`${h.toString().padStart(2, "0")}:00`);

const MEMBER_COLORS = [
  { dot: "bg-blue-500",   bg: "bg-blue-500/20",  border: "border-blue-500/50",  text: "text-blue-400" },
  { dot: "bg-green-500",  bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400" },
  { dot: "bg-purple-500", bg: "bg-purple-500/20",border: "border-purple-500/50",text: "text-purple-400" },
  { dot: "bg-amber-500",  bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-400" },
  { dot: "bg-rose-500",   bg: "bg-rose-500/20",  border: "border-rose-500/50",  text: "text-rose-400" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(n: number) {
  return `${Math.floor(n / 60).toString().padStart(2, "0")}:${(n % 60).toString().padStart(2, "0")}`;
}
function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function formatShortDate(date: Date): string {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
}
function formatMonthYear(date: Date): string {
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Cell key: "MONDAY|09:00"
function cellKey(dayId: string, hour: string) { return `${dayId}|${hour}`; }
function parseKey(key: string): [string, string] {
  const i = key.indexOf("|");
  return [key.slice(0, i), key.slice(i + 1)];
}
function getRectCells(anchor: {row:number;col:number}, cur: {row:number;col:number}): Set<string> {
  const r0 = Math.min(anchor.row, cur.row), r1 = Math.max(anchor.row, cur.row);
  const c0 = Math.min(anchor.col, cur.col), c1 = Math.max(anchor.col, cur.col);
  const cells = new Set<string>();
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++)
      cells.add(cellKey(DAYS[c].id, HOURS[r]));
  return cells;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface ActiveSlot { memberId: number; colorIdx: number; scheduleId: number; }
interface TeamScheduleGridProps { refreshKey?: number; }

// ── Component ────────────────────────────────────────────────────────────────

export default function TeamScheduleGrid({ refreshKey }: TeamScheduleGridProps) {
  const [team, setTeam]                   = useState<TeamMember[]>([]);
  const [schedulesByMember, setSchedulesByMember] = useState<Record<number, WorkSchedule[]>>({});
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [weekOffset, setWeekOffset]       = useState(0);

  // ── Selection state ──────────────────────────────────────────────────────
  // committed  = cells definitively in selection
  // dragPreview = cells highlighted during current drag (not yet committed)
  // dragMode    = whether drag is adding or removing cells
  const [committed, setCommitted]     = useState<Set<string>>(new Set());
  const [dragPreview, setDragPreview] = useState<Set<string>>(new Set());
  const [dragMode, setDragMode]       = useState<"add" | "remove">("add");

  // Refs for event handlers (avoid stale closures)
  const isDraggingRef   = useRef(false);
  const hasDraggedRef   = useRef(false); // true once mouse enters a DIFFERENT cell
  const dragAnchorRef   = useRef<{row:number;col:number} | null>(null);
  const dragPreviewRef  = useRef<Set<string>>(new Set());
  const dragModeRef     = useRef<"add" | "remove">("add");
  useEffect(() => { dragPreviewRef.current = dragPreview; }, [dragPreview]);
  useEffect(() => { dragModeRef.current = dragMode; }, [dragMode]);

  // Effective selection = committed ∪ dragPreview  (or \ dragPreview when removing)
  const effectiveSelection = useMemo(() => {
    const sel = new Set(committed);
    for (const k of dragPreview) {
      if (dragMode === "add") sel.add(k);
      else sel.delete(k);
    }
    return sel;
  }, [committed, dragPreview, dragMode]);

  // ── Week dates ───────────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekStart = addDays(getMondayOfWeek(today), Math.max(0, weekOffset) * 7);
  const weekEnd   = addDays(weekStart, 6);
  const colDates  = DAYS.map((_, i) => addDays(weekStart, i));
  const isPastCol = (col: number) => colDates[col] < today;

  // ── Init / reload ────────────────────────────────────────────────────────
  useEffect(() => { load(); }, [refreshKey]);

  async function load() {
    setLoading(true);
    try {
      const user = await authService.getProfile();
      if (!user) return null;
      setCurrentUserId(user.id);
      const members = await workScheduleService.getTeam();
      setTeam(members);
      const entries = await Promise.all(
        members.map(async m => {
          const forProv = m.id !== user.id ? m.id : undefined;
          const s = await workScheduleService.getMyWorkSchedules(forProv);
          return [m.id, s] as [number, WorkSchedule[]];
        })
      );
      const sched = Object.fromEntries(entries);
      setSchedulesByMember(sched);
      return { members, schedules: sched };
    } catch {
      setError("Error al cargar los horarios del equipo");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ── Active slot computation ──────────────────────────────────────────────
  function computeActiveSlots(
    day: string, hour: string,
    teamData: TeamMember[], schedulesData: Record<number, WorkSchedule[]>,
  ): ActiveSlot[] {
    const hourMin = timeToMinutes(hour);
    const result: ActiveSlot[] = [];
    for (let i = 0; i < teamData.length; i++) {
      const m = teamData[i];
      const sched = (schedulesData[m.id] ?? []).find(s => s.dayOfWeek === day && s.isActive);
      if (!sched) continue;
      const start = timeToMinutes(sched.startTime);
      const end   = timeToMinutes(sched.endTime);
      const bStart = sched.breakStart?.trim() ? timeToMinutes(sched.breakStart) : null;
      const bEnd   = sched.breakEnd?.trim()   ? timeToMinutes(sched.breakEnd)   : null;
      if (hourMin >= start && hourMin < end) {
        if (bStart !== null && bEnd !== null && hourMin >= bStart && hourMin < bEnd) continue;
        result.push({ memberId: m.id, colorIdx: i % MEMBER_COLORS.length, scheduleId: sched.id });
      }
    }
    return result;
  }

  const getActiveSlots = useCallback(
    (day: string, hour: string) => computeActiveSlots(day, hour, team, schedulesByMember),
    [team, schedulesByMember],
  );

  // ── Member status in current selection ───────────────────────────────────
  function getMemberStatus(memberId: number): "all" | "some" | "none" {
    const cells = [...effectiveSelection];
    if (cells.length === 0) return "none";
    let active = 0;
    for (const key of cells) {
      const [day, hour] = parseKey(key);
      if (computeActiveSlots(day, hour, team, schedulesByMember).some(s => s.memberId === memberId))
        active++;
    }
    if (active === 0) return "none";
    if (active === cells.length) return "all";
    return "some";
  }

  // ── Batch toggle for all selected cells ──────────────────────────────────
  async function handleBatchToggle(memberId: number) {
    if (saving || effectiveSelection.size === 0) return;
    setSaving(true);

    const status  = getMemberStatus(memberId);
    const isAdding = status !== "all"; // add unless all are already active
    const forProvider = memberId !== currentUserId ? memberId : undefined;

    // Group selected cells by day
    const byDay = new Map<string, number[]>(); // day → [minuteValues]
    for (const key of effectiveSelection) {
      const [day, hour] = parseKey(key);
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(timeToMinutes(hour));
    }

    try {
      for (const [day, hourMins] of byDay) {
        const sorted   = [...hourMins].sort((a, b) => a - b);
        const existing = (schedulesByMember[memberId] ?? []).find(s => s.dayOfWeek === day && s.isActive);

        if (isAdding) {
          const minH = sorted[0];
          const maxH = sorted[sorted.length - 1] + 60;
          if (existing) {
            const newStart = Math.min(timeToMinutes(existing.startTime), minH);
            const newEnd   = Math.max(timeToMinutes(existing.endTime),   maxH);
            await workScheduleService.updateWorkSchedule(existing.id, {
              startTime: minutesToTime(newStart),
              endTime:   minutesToTime(newEnd),
            });
          } else {
            await workScheduleService.createWorkSchedule({
              dayOfWeek: day,
              startTime: minutesToTime(minH),
              endTime:   minutesToTime(Math.min(maxH, 22 * 60)),
              slotDurationMinutes: 30,
            }, forProvider);
          }
        } else {
          if (!existing) continue;
          // Compute kept hours (existing hours minus selected ones)
          const exStart = timeToMinutes(existing.startTime);
          const exEnd   = timeToMinutes(existing.endTime);
          const exHours: number[] = [];
          for (let h = exStart; h < exEnd; h += 60) exHours.push(h);
          const removeSet  = new Set(sorted);
          const keptHours  = exHours.filter(h => !removeSet.has(h));
          if (keptHours.length === 0) {
            await workScheduleService.deleteWorkSchedule(existing.id);
          } else {
            await workScheduleService.updateWorkSchedule(existing.id, {
              startTime: minutesToTime(keptHours[0]),
              endTime:   minutesToTime(keptHours[keptHours.length - 1] + 60),
            });
          }
        }
      }
      await load();
      setCommitted(new Set()); // clear selection after applying
    } catch {
      setError("Error al actualizar el horario");
    } finally {
      setSaving(false);
    }
  }

  // ── Mouse selection handlers ─────────────────────────────────────────────
  function handleCellMouseDown(row: number, col: number, e: React.MouseEvent) {
    if (isPastCol(col)) return;
    e.preventDefault(); // prevent text selection during drag
    const key = cellKey(DAYS[col].id, HOURS[row]);
    const mode: "add" | "remove" = committed.has(key) ? "remove" : "add";
    dragModeRef.current   = mode;
    setDragMode(mode);
    isDraggingRef.current  = true;
    hasDraggedRef.current  = false; // reset — no real drag yet
    dragAnchorRef.current  = { row, col };
    // Don't set dragPreview here — wait until mouse enters a DIFFERENT cell
    dragPreviewRef.current = new Set();
    setDragPreview(new Set());
  }

  function handleCellMouseEnter(row: number, col: number) {
    if (isPastCol(col)) return;
    if (!isDraggingRef.current || !dragAnchorRef.current) return;
    const anchor = dragAnchorRef.current;
    // Ignore re-entry into the anchor cell itself (no movement = still a click)
    if (row === anchor.row && col === anchor.col) return;
    hasDraggedRef.current = true;
    // Now include the anchor cell + everything up to current cell
    const cells = getRectCells(anchor, { row, col });
    dragPreviewRef.current = cells;
    setDragPreview(cells);
  }

  // Global mouseup — click: toggle anchor cell; drag: commit preview rectangle
  useEffect(() => {
    function onMouseUp() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (!hasDraggedRef.current) {
        // Pure click — toggle only the anchor cell
        const anchor = dragAnchorRef.current;
        if (anchor) {
          const key = cellKey(DAYS[anchor.col].id, HOURS[anchor.row]);
          setCommitted(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
          });
        }
      } else {
        // Real drag — commit the preview rectangle
        const preview = dragPreviewRef.current;
        const mode    = dragModeRef.current;
        setCommitted(prev => {
          const next = new Set(prev);
          for (const k of preview) {
            if (mode === "add") next.add(k);
            else next.delete(k);
          }
          return next;
        });
      }

      hasDraggedRef.current  = false;
      dragAnchorRef.current  = null;
      dragPreviewRef.current = new Set();
      setDragPreview(new Set());
    }
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  // Escape clears selection
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setCommitted(new Set());
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getMemberName = (id: number) => {
    const m = team.find(t => t.id === id);
    if (!m) return "";
    const n = m.email.split("@")[0];
    return n.charAt(0).toUpperCase() + n.slice(1);
  };
  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth()    === today.getMonth()    &&
    date.getDate()     === today.getDate();

  // ── Cell visual class ─────────────────────────────────────────────────────
  function cellClass(dayId: string, hour: string, hasSlots: boolean, col: number): string {
    if (isPastCol(col)) {
      return "w-full h-7 rounded border border-pm-border/10 bg-pm-bg/30 flex items-center justify-center gap-0.5 px-1 select-none cursor-not-allowed opacity-40 ";
    }

    const key        = cellKey(dayId, hour);
    const isSelected = effectiveSelection.has(key);
    const isPreview  = dragPreview.has(key);
    const isRemoving = isPreview && dragMode === "remove" && committed.has(key);

    const base = "w-full h-7 rounded border transition-colors flex items-center justify-center gap-0.5 px-1 select-none cursor-pointer ";

    if (isRemoving)  return base + "border-red-400/50 bg-red-500/10";
    if (isSelected)  return base + "border-pm-gold/70 bg-pm-gold/15 ring-1 ring-pm-gold/30";
    if (isPreview && dragMode === "add") return base + "border-pm-gold/40 bg-pm-gold/8";
    if (hasSlots)    return base + "border-pm-border/60 bg-pm-elevated/60";
    return base + "border-pm-border/20 hover:bg-pm-elevated/30 hover:border-pm-border/40";
  }

  // ── Loading / error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-pm-border border-t-pm-gold mx-auto" />
      <p className="mt-4 text-pm-muted text-sm">Cargando horarios del equipo...</p>
    </div>
  );
  if (error) return (
    <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Legend + week navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          {team.map((m, i) => (
            <div key={m.id} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${MEMBER_COLORS[i % MEMBER_COLORS.length].dot}`} />
              <span className="text-xs text-pm-muted">
                {getMemberName(m.id)}{m.id === currentUserId ? " (tú)" : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-pm-border disabled:hover:text-pm-muted"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="text-xs text-pm-muted min-w-[120px] text-center">
            {formatShortDate(weekStart)} – {formatShortDate(weekEnd)} · {formatMonthYear(weekStart)}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-xs text-pm-gold hover:text-pm-gold-light transition-colors ml-1">
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* Hint — always rendered to avoid layout shift */}
      <p className={`text-xs text-pm-dim transition-opacity duration-150 ${effectiveSelection.size === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        Haz clic o arrastra sobre los bloques para seleccionarlos, luego asígnalos a un proveedor desde el panel inferior.
      </p>

      {/* Grid */}
      <div
        className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden"
        style={{ userSelect: "none" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-xs border-collapse">
            <thead>
              <tr className="border-b border-pm-border">
                <th className="w-14 px-3 py-3 text-pm-dim font-normal" />
                {DAYS.map((d, i) => {
                  const date     = colDates[i];
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
              {HOURS.map((hour, row) => (
                <tr key={hour} className="border-t border-pm-border/40">
                  <td className="px-3 py-0.5 text-pm-dim text-right text-xs w-14 align-middle">{hour}</td>
                  {DAYS.map((day, col) => {
                    const slots    = getActiveSlots(day.id, hour);
                    const todayCol = isToday(colDates[col]);
                    const key      = cellKey(day.id, hour);
                    const isSelected = effectiveSelection.has(key);
                    return (
                      <td key={day.id} className={`px-1 py-0.5 ${todayCol ? "bg-pm-gold/5" : ""}`}>
                        <div
                          onMouseDown={e => handleCellMouseDown(row, col, e)}
                          onMouseEnter={() => handleCellMouseEnter(row, col)}
                          className={cellClass(day.id, hour, slots.length > 0, col)}
                          title={slots.length > 0
                            ? slots.map(s => getMemberName(s.memberId)).join(", ")
                            : "Sin asignar"
                          }
                        >
                          {isSelected
                            ? <svg className="w-3 h-3 text-pm-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            : slots.length > 0
                              ? slots.map(s => (
                                  <div key={s.memberId} className={`w-2 h-2 rounded-full flex-shrink-0 ${MEMBER_COLORS[s.colorIdx].dot}`} />
                                ))
                              : <span className="text-pm-border/50 text-xs">+</span>
                          }
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action panel — always rendered to avoid layout shift, shown via opacity/pointer-events */}
      <div
        className={`sticky bottom-4 z-40 transition-all duration-150 ${
          effectiveSelection.size > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-pm-surface border border-pm-gold/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-5 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Count */}
            <div className="flex-shrink-0">
              <p className="text-sm font-semibold text-pm-text">
                {effectiveSelection.size} bloque{effectiveSelection.size !== 1 ? "s" : ""} seleccionado{effectiveSelection.size !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-pm-dim mt-0.5">Clic en un proveedor para asignar o quitar</p>
            </div>

            {/* Provider buttons */}
            <div className="flex flex-wrap gap-2 flex-1">
              {team.map((m, i) => {
                const color  = MEMBER_COLORS[i % MEMBER_COLORS.length];
                const status = getMemberStatus(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => handleBatchToggle(m.id)}
                    disabled={saving}
                    title={
                      status === "all"  ? "Quitar de todos los bloques seleccionados" :
                      status === "some" ? "Añadir a los bloques faltantes" :
                      "Añadir a todos los bloques seleccionados"
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-50
                      ${status === "all"
                        ? `${color.bg} ${color.border} ${color.text}`
                        : status === "some"
                        ? `${color.bg} ${color.border} ${color.text} opacity-60`
                        : "border-pm-border text-pm-muted hover:border-pm-gold hover:text-pm-text"
                      }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color.dot}`} />
                    {getMemberName(m.id)}{m.id === currentUserId ? " (tú)" : ""}
                    {status === "all" && (
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                    {status === "some" && (
                      <span className="w-3 h-3 flex items-center justify-center text-[10px] flex-shrink-0">~</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {saving && (
                <div className="flex items-center gap-1.5 text-xs text-pm-muted">
                  <div className="animate-spin rounded-full h-3 w-3 border border-pm-border border-t-pm-gold" />
                  Guardando...
                </div>
              )}
              <button
                onClick={() => setCommitted(new Set())}
                className="text-xs text-pm-muted hover:text-pm-text transition-colors px-2 py-1 rounded hover:bg-pm-elevated"
              >
                Limpiar · Esc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
