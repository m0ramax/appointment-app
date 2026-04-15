import { useState, useEffect } from "react";
import { adminService, type InviteToken, type Business, type AdminStats } from "../../lib/api/admin";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

function StatusBadge({ used, expiresAt }: { used: boolean; expiresAt: string }) {
  if (used) return <span className="px-2 py-0.5 text-xs rounded-full bg-pm-elevated text-pm-dim border border-pm-border">Usado</span>;
  if (new Date(expiresAt) < new Date()) return <span className="px-2 py-0.5 text-xs rounded-full bg-red-400/10 text-red-400 border border-red-400/20">Expirado</span>;
  return <span className="px-2 py-0.5 text-xs rounded-full bg-green-400/10 text-green-400 border border-green-400/20">Activo</span>;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [tab, setTab] = useState<"invites" | "businesses">("invites");
  const [error, setError] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [s, i, b] = await Promise.all([
        adminService.getStats(),
        adminService.getInvites(),
        adminService.getBusinesses(),
      ]);
      setStats(s);
      setInvites(i);
      setBusinesses(b);
    } catch {
      setError("Error al cargar datos. Verifica que tienes permisos de Super Admin.");
    }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const invite = await adminService.createInvite(note || undefined);
      setInvites(prev => [invite, ...prev]);
      setNote("");
      setStats(prev => prev ? { ...prev, activeInvites: prev.activeInvites + 1 } : prev);
    } catch {
      setError("Error al crear invitación");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm("¿Revocar esta invitación?")) return;
    try {
      await adminService.revokeInvite(id);
      setInvites(prev => prev.map(i => i.id === id ? { ...i, used: true } : i));
    } catch {
      setError("Error al revocar invitación");
    }
  }

  function copyLink(invite: InviteToken) {
    const url = `${BASE_URL}/register?token=${invite.token}`;
    navigator.clipboard.writeText(url);
    setCopied(invite.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      tab === t
        ? "bg-pm-gold text-pm-bg"
        : "text-pm-muted border border-pm-border hover:border-pm-gold hover:text-pm-text"
    }`;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Negocios", value: stats.businesses, color: "text-pm-gold" },
            { label: "Citas totales", value: stats.appointments, color: "text-blue-400" },
            { label: "Invites activos", value: stats.activeInvites, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-pm-surface border border-pm-border rounded-xl p-4">
              <p className="text-xs text-pm-dim uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button className={tabClass("invites")} onClick={() => setTab("invites")}>Invitaciones</button>
        <button className={tabClass("businesses")} onClick={() => setTab("businesses")}>Negocios</button>
      </div>

      {tab === "invites" && (
        <div className="space-y-4">
          {/* Create invite */}
          <div className="bg-pm-surface border border-pm-border rounded-xl p-4">
            <p className="text-sm font-semibold text-pm-text mb-3">Nueva invitación</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Nota opcional (ej: Barbería Central)"
                className="flex-1 px-3 py-2 text-sm bg-pm-bg border border-pm-border rounded-lg text-pm-text focus:outline-none focus:border-pm-gold"
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? "Creando..." : "Generar link"}
              </button>
            </div>
          </div>

          {/* Invite list */}
          <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
            {invites.length === 0 ? (
              <p className="text-center py-10 text-pm-muted text-sm">No hay invitaciones aún</p>
            ) : (
              <ul className="divide-y divide-pm-border">
                {invites.map(invite => (
                  <li key={invite.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge used={invite.used} expiresAt={invite.expiresAt} />
                        {invite.note && <span className="text-sm text-pm-text font-medium">{invite.note}</span>}
                      </div>
                      <p className="text-xs text-pm-dim font-mono truncate">{`${BASE_URL}/register?token=${invite.token}`}</p>
                      <p className="text-xs text-pm-dim mt-0.5">
                        Creado {new Date(invite.createdAt).toLocaleDateString("es")} · Expira {new Date(invite.expiresAt).toLocaleDateString("es")}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!invite.used && new Date(invite.expiresAt) > new Date() && (
                        <>
                          <button
                            onClick={() => copyLink(invite)}
                            className="px-3 py-1.5 text-xs font-medium border border-pm-border rounded-lg text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors"
                          >
                            {copied === invite.id ? "¡Copiado!" : "Copiar"}
                          </button>
                          <button
                            onClick={() => handleRevoke(invite.id)}
                            className="px-3 py-1.5 text-xs font-medium border border-red-400/30 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            Revocar
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {tab === "businesses" && (
        <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
          {businesses.length === 0 ? (
            <p className="text-center py-10 text-pm-muted text-sm">No hay negocios registrados</p>
          ) : (
            <ul className="divide-y divide-pm-border">
              {businesses.map(b => (
                <li key={b.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-pm-text">{b.name}</p>
                    <p className="text-xs text-pm-dim mt-0.5">{b.whatsappNumber}</p>
                  </div>
                  <span className="text-xs text-pm-dim">ID #{b.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
