import { useState, useEffect } from "react";
import { adminService, platformSettingsService, type InviteToken, type Business, type AdminStats, type PlatformSettings } from "../../lib/api/admin";
import ConfirmModal, { type ConfirmModalState } from "../ui/ConfirmModal";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

function StatusBadge({ used, expiresAt }: { used: boolean; expiresAt: string }) {
  if (used) return <span className="px-2 py-0.5 text-xs rounded-full bg-pm-elevated text-pm-dim border border-pm-border">Usado</span>;
  if (new Date(expiresAt) < new Date()) return <span className="px-2 py-0.5 text-xs rounded-full bg-red-400/10 text-red-400 border border-red-400/20">Expirado</span>;
  return <span className="px-2 py-0.5 text-xs rounded-full bg-green-400/10 text-green-400 border border-green-400/20">Activo</span>;
}

function SuspendedBadge() {
  return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-red-400/10 text-red-400 border border-red-400/20">
      Suspendido
    </span>
  );
}

function TeamModeBadge({ teamMode }: { teamMode: boolean }) {
  return teamMode ? (
    <span className="px-2 py-0.5 text-xs rounded-full bg-violet-400/10 text-violet-400 border border-violet-400/20">
      Equipo
    </span>
  ) : (
    <span className="px-2 py-0.5 text-xs rounded-full bg-pm-elevated text-pm-dim border border-pm-border">
      Solo
    </span>
  );
}


export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [invites, setInvites] = useState<InviteToken[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [tab, setTab] = useState<"invites" | "businesses">("businesses");
  const [error, setError] = useState("");
  const [businessErrors, setBusinessErrors] = useState<Record<number, string>>({});
  const [modal, setModal] = useState<ConfirmModalState | null>(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [s, i, b, ps] = await Promise.all([
        adminService.getStats(),
        adminService.getInvites(),
        adminService.getAdminBusinesses(),
        platformSettingsService.get(),
      ]);
      setStats(s);
      setInvites(i);
      setBusinesses(b);
      setPlatformSettings(ps);
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

  function handleRevoke(id: number) {
    setModal({
      title: "Revocar invitación",
      message: "El link dejará de funcionar inmediatamente.",
      confirmLabel: "Revocar",
      variant: "danger",
      onConfirm: async () => {
        setModal(null);
        try {
          await adminService.revokeInvite(id);
          setInvites(prev => prev.map(i => i.id === id ? { ...i, used: true } : i));
        } catch {
          setError("Error al revocar invitación");
        }
      },
    });
  }

  function handleToggleSuspend(b: Business) {
    const suspending = !b.suspended;
    setModal({
      title: suspending ? `Suspender "${b.name}"` : `Activar "${b.name}"`,
      message: suspending
        ? "Los usuarios del negocio no podrán iniciar sesión ni usar la plataforma."
        : "El negocio volverá a tener acceso completo a la plataforma.",
      confirmLabel: suspending ? "Suspender" : "Activar",
      variant: suspending ? "danger" : "warning",
      onConfirm: async () => {
        setModal(null);
        try {
          const updated = suspending
            ? await adminService.suspendBusiness(b.id)
            : await adminService.activateBusiness(b.id);
          setBusinesses(prev => prev.map(x => x.id === updated.id ? updated : x));
          setBusinessErrors(prev => { const n = { ...prev }; delete n[b.id]; return n; });
        } catch (e: any) {
          const msg = e?.response?.data?.message || `Error al ${suspending ? 'suspender' : 'activar'} el negocio`;
          setBusinessErrors(prev => ({ ...prev, [b.id]: msg }));
        }
      },
    });
  }

  function handleDeleteBusiness(b: Business) {
    setModal({
      title: `Eliminar "${b.name}"`,
      message: "Esta acción es permanente y no se puede deshacer. Se eliminarán todos los datos del negocio.",
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        setModal(null);
        try {
          await adminService.deleteBusiness(b.id);
          setBusinesses(prev => prev.filter(x => x.id !== b.id));
          setStats(prev => prev ? { ...prev, businesses: prev.businesses - 1 } : prev);
        } catch (e: any) {
          const msg = e?.response?.data?.message || 'Error al eliminar el negocio';
          setBusinessErrors(prev => ({ ...prev, [b.id]: msg }));
        }
      },
    });
  }

  function handleToggleRegistration() {
    if (!platformSettings) return;
    const disabling = platformSettings.registrationEnabled;
    if (disabling) {
      setModal({
        title: "Deshabilitar el registro",
        message: "¿Deshabilitar el registro? Los nuevos negocios no podrán registrarse.",
        confirmLabel: "Deshabilitar",
        variant: "warning",
        onConfirm: async () => {
          setModal(null);
          try {
            const updated = await platformSettingsService.update({ registrationEnabled: false });
            setPlatformSettings(updated);
          } catch {
            setError("Error al actualizar la configuración de registro");
          }
        },
      });
    } else {
      // Enabling is non-destructive — no confirmation needed
      platformSettingsService.update({ registrationEnabled: true })
        .then(updated => setPlatformSettings(updated))
        .catch(() => setError("Error al actualizar la configuración de registro"));
    }
  }

  function handleToggleTeamMode(b: Business) {
    const enabling = !b.teamMode;
    setModal({
      title: enabling ? `Activar modo equipo en "${b.name}"` : `Desactivar modo equipo en "${b.name}"`,
      message: enabling
        ? "El negocio podrá gestionar múltiples proveedores y asignarles citas."
        : "El negocio volverá al modo individual. Los proveedores adicionales no serán visibles.",
      confirmLabel: enabling ? "Activar equipo" : "Cambiar a solo",
      variant: "warning",
      onConfirm: async () => {
        setModal(null);
        try {
          const updated = await adminService.toggleTeamMode(b.id, enabling);
          setBusinesses(prev => prev.map(x => x.id === updated.id ? updated : x));
          setBusinessErrors(prev => { const n = { ...prev }; delete n[b.id]; return n; });
        } catch (e: any) {
          const msg = e?.response?.data?.message || `Error al ${enabling ? 'activar' : 'desactivar'} el modo equipo`;
          setBusinessErrors(prev => ({ ...prev, [b.id]: msg }));
        }
      },
    });
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
    <>
    {modal && <ConfirmModal modal={modal} onCancel={() => setModal(null)} />}
    <div className="space-y-6">
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Negocios", value: stats.businesses, color: "text-pm-gold" },
            { label: "Invites activos", value: stats.activeInvites, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="bg-pm-surface border border-pm-border rounded-xl p-4">
              <p className="text-xs text-pm-dim uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Platform settings */}
      {platformSettings !== null && (
        <div className="bg-pm-surface border border-pm-border rounded-xl p-4">
          <p className="text-xs font-semibold text-pm-dim uppercase tracking-wider mb-3">Configuracion de plataforma</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pm-text">Registro de nuevos negocios</p>
              <p className="text-xs text-pm-muted mt-0.5">
                {platformSettings.registrationEnabled ? "Habilitado" : "Deshabilitado"}
              </p>
            </div>
            <button
              onClick={handleToggleRegistration}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                platformSettings.registrationEnabled ? "bg-green-500" : "bg-pm-border"
              }`}
              role="switch"
              aria-checked={platformSettings.registrationEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  platformSettings.registrationEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
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
                <li key={b.id} className="px-4 py-4">
                  {businessErrors[b.id] && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs">
                      {businessErrors[b.id]}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-pm-text">{b.name}</p>
                      {b.suspended && <SuspendedBadge />}
                      <TeamModeBadge teamMode={b.teamMode} />
                    </div>
                    {b.users[0] && (
                      <p className="text-xs text-pm-muted">{b.users[0].email}</p>
                    )}
                    <p className="text-xs text-pm-dim">{b.whatsappNumber}</p>
                    <p className="text-xs text-pm-dim mt-0.5">
                      {b._count.users} usuarios · {b._count.services} servicios · activo desde {b.createdAt ? new Date(b.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-pm-dim">ID #{b.id}</span>
                    {/* Team mode toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-pm-dim">Equipo</span>
                      <button
                        onClick={() => handleToggleTeamMode(b)}
                        role="switch"
                        aria-checked={b.teamMode}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          b.teamMode ? 'bg-violet-500' : 'bg-pm-border'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          b.teamMode ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        }`} />
                      </button>
                    </div>
                    {/* Suspend toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-pm-dim">Activo</span>
                      <button
                        onClick={() => handleToggleSuspend(b)}
                        role="switch"
                        aria-checked={!b.suspended}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          !b.suspended ? 'bg-green-500' : 'bg-pm-border'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          !b.suspended ? 'translate-x-[18px]' : 'translate-x-[3px]'
                        }`} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteBusiness(b)}
                      className="px-3 py-1.5 text-xs font-medium border border-red-400/30 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
    </>
  );
}
