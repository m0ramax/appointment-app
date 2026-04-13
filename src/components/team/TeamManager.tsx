import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import { workScheduleService, type TeamMember } from "../../lib/api/work-schedule";

export default function TeamManager() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => { loadTeam(); }, []);

  async function loadTeam() {
    setLoading(true);
    setError("");
    try {
      const members = await workScheduleService.getTeam();
      setTeam(members);
    } catch {
      setError("Error al cargar el equipo");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await authService.registerProvider({ email: form.email, password: form.password });
      setSuccess(`Proveedor ${form.email} creado exitosamente`);
      setForm({ email: "", password: "" });
      setShowForm(false);
      await loadTeam();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Error al crear el proveedor");
    } finally {
      setSaving(false);
    }
  }

  const getMemberName = (m: TeamMember) => {
    const name = m.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getRoleBadge = (role: string) => {
    if (role === "OWNER") return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-pm-gold/20 text-pm-gold border border-pm-gold/30">Dueño</span>
    );
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Proveedor</span>
    );
  };

  if (loading) return (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-pm-border border-t-pm-gold mx-auto"></div>
      <p className="mt-4 text-pm-muted text-sm">Cargando equipo...</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-pm-text">Miembros del equipo</h3>
          <p className="text-xs text-pm-muted mt-0.5">{team.length} {team.length === 1 ? "miembro" : "miembros"}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Agregar proveedor
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-400/10 border border-green-400/20 text-green-400 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-pm-surface border border-pm-gold/30 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-pm-text mb-4">Nuevo proveedor</h4>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-pm-muted mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="proveedor@ejemplo.com"
                  required
                  className="w-full px-3 py-2 border border-pm-border rounded-lg bg-pm-bg text-pm-text text-sm focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-pm-muted mb-1">Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  className="w-full px-3 py-2 border border-pm-border rounded-lg bg-pm-bg text-pm-text text-sm focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); setForm({ email: "", password: "" }); }}
                className="px-4 py-2 text-sm text-pm-muted border border-pm-border rounded-lg hover:border-pm-gold hover:text-pm-text transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "Creando..." : "Crear proveedor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team list */}
      <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
        {team.length === 0 ? (
          <div className="px-5 py-10 text-center text-pm-muted text-sm">
            No hay miembros en el equipo todavía.
          </div>
        ) : (
          <div className="divide-y divide-pm-border">
            {team.map(member => (
              <div key={member.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pm-elevated border border-pm-border flex items-center justify-center text-pm-muted text-sm font-semibold">
                    {getMemberName(member).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pm-text">{getMemberName(member)}</p>
                    <p className="text-xs text-pm-dim">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(member.role)}
                  <a
                    href="/provider/schedule"
                    className="text-xs text-pm-muted hover:text-pm-gold transition-colors"
                  >
                    Ver horario
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
