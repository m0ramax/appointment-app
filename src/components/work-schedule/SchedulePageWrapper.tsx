import { useState } from "react";
import TeamScheduleGrid from "./TeamScheduleGrid";
import WorkScheduleManager from "./WorkScheduleManager";

export default function SchedulePageWrapper() {
  const [tab, setTab] = useState<"grid" | "list">("grid");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleScheduleUpdate() {
    setRefreshKey(k => k + 1);
  }

  const tabBase = "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors";
  const tabActive = `${tabBase} border-pm-gold text-pm-gold`;
  const tabInactive = `${tabBase} border-transparent text-pm-muted hover:text-pm-text`;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-pm-border">
        <button onClick={() => setTab("grid")} className={tab === "grid" ? tabActive : tabInactive}>
          Vista por bloques
        </button>
        <button onClick={() => setTab("list")} className={tab === "list" ? tabActive : tabInactive}>
          Configuración detallada
        </button>
      </div>

      {tab === "grid" ? (
        <TeamScheduleGrid refreshKey={refreshKey} />
      ) : (
        <WorkScheduleManager onScheduleUpdate={handleScheduleUpdate} />
      )}
    </div>
  );
}
