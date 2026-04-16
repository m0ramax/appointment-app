import { useState, useEffect } from "react";
import TeamScheduleGrid from "./TeamScheduleGrid";
import WorkScheduleManager from "./WorkScheduleManager";
import { authService, apiClient } from "../../lib/api/auth";

export default function SchedulePageWrapper() {
  const [tab, setTab] = useState<"grid" | "list">("list");
  const [refreshKey, setRefreshKey] = useState(0);
  const [teamMode, setTeamMode] = useState(false);
  const [loadingTeamMode, setLoadingTeamMode] = useState(true);

  useEffect(() => {
    authService.getProfile().then(user => {
      if (!user || user.role?.toUpperCase() !== "OWNER" || !user.businessId) {
        setLoadingTeamMode(false);
        return;
      }
      apiClient.get<{ teamMode?: boolean }>(`/business/${user.businessId}`)
        .then(r => {
          const tm = r.data.teamMode === true;
          setTeamMode(tm);
          setTab(tm ? "grid" : "list");
        })
        .catch(() => {})
        .finally(() => setLoadingTeamMode(false));
    }).catch(() => setLoadingTeamMode(false));
  }, []);

  function handleScheduleUpdate() {
    setRefreshKey(k => k + 1);
  }

  const tabBase = "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors";
  const tabActive = `${tabBase} border-pm-gold text-pm-gold`;
  const tabInactive = `${tabBase} border-transparent text-pm-muted hover:text-pm-text`;

  if (loadingTeamMode) return null;

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-pm-border">
        {teamMode && (
          <button onClick={() => setTab("grid")} className={tab === "grid" ? tabActive : tabInactive}>
            Vista por bloques
          </button>
        )}
        <button onClick={() => setTab("list")} className={tab === "list" ? tabActive : tabInactive}>
          Configuración detallada
        </button>
      </div>

      {tab === "grid" && teamMode ? (
        <TeamScheduleGrid refreshKey={refreshKey} />
      ) : (
        <WorkScheduleManager onScheduleUpdate={handleScheduleUpdate} />
      )}
    </div>
  );
}
