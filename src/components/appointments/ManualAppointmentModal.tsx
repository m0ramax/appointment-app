import { useState, useEffect } from "react";
import { appointmentService, type ManualAppointmentCreate } from "../../lib/api/appointments";
import { workScheduleService, type TeamMember } from "../../lib/api/work-schedule";
import { apiClient } from "../../lib/api/auth";

interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  price?: number;
}

interface Props {
  businessId: number;
  onClose: () => void;
  onCreated: () => void;
}

function todayLocalISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function ManualAppointmentModal({ businessId, onClose, onCreated }: Props) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clientEmail: "",
    providerId: "",
    serviceId: "",
    title: "",
    date: todayLocalISO(),
    time: "09:00",
    durationMinutes: 60,
  });

  useEffect(() => {
    workScheduleService.getTeam().then(setTeam).catch(() => {});
    apiClient.get<Service[]>(`/services/business/${businessId}`)
      .then(r => setServices(r.data))
      .catch(() => {});
  }, [businessId]);

  // When a service is selected, auto-fill title and duration
  function handleServiceChange(serviceId: string) {
    const svc = services.find(s => s.id === +serviceId);
    setForm(f => ({
      ...f,
      serviceId,
      title: svc ? svc.name : f.title,
      durationMinutes: svc ? svc.durationMinutes : f.durationMinutes,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError("");
    const dateTime = new Date(`${form.date}T${form.time}:00`);
    if (dateTime <= new Date()) {
      setError("No puedes crear citas en el pasado");
      return;
    }
    setSaving(true);
    try {
      const data: ManualAppointmentCreate = {
        clientEmail: form.clientEmail,
        providerId: +form.providerId,
        title: form.title || "Cita",
        dateTime: dateTime.toISOString(),
        durationMinutes: form.durationMinutes,
        ...(form.serviceId ? { serviceId: +form.serviceId } : {}),
      };
      await appointmentService.createManualAppointment(data);
      onCreated();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Error al crear la cita");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 border border-pm-border rounded-lg bg-pm-bg text-pm-text text-sm focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors";
  const labelClass = "block text-xs font-medium text-pm-muted mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="bg-pm-surface border border-pm-border rounded-2xl p-6 w-full max-w-md shadow-premium"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-pm-text">Nueva cita manual</h3>
          <button onClick={onClose} className="text-pm-dim hover:text-pm-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-400/10 border border-red-400/20 text-red-400 px-3 py-2 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider */}
          <div>
            <label className={labelClass}>Proveedor</label>
            <select
              value={form.providerId}
              onChange={e => setForm(f => ({ ...f, providerId: e.target.value }))}
              required
              className={inputClass}
            >
              <option value="">Seleccionar proveedor</option>
              {team.map(m => (
                <option key={m.id} value={String(m.id)} className="bg-pm-elevated">
                  {m.email.split("@")[0].charAt(0).toUpperCase() + m.email.split("@")[0].slice(1)}
                  {m.role === "OWNER" ? " (Admin)" : " (Proveedor)"}
                </option>
              ))}
            </select>
          </div>

          {/* Client email */}
          <div>
            <label className={labelClass}>Email del cliente</label>
            <input
              type="email"
              value={form.clientEmail}
              onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
              placeholder="cliente@ejemplo.com"
              required
              className={inputClass}
            />
            <p className="text-xs text-pm-dim mt-1">Si no existe, se crea automáticamente.</p>
          </div>

          {/* Service (optional) */}
          {services.length > 0 && (
            <div>
              <label className={labelClass}>Servicio (opcional)</label>
              <select
                value={form.serviceId}
                onChange={e => handleServiceChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Sin servicio específico</option>
                {services.map(s => (
                  <option key={s.id} value={s.id} className="bg-pm-elevated">
                    {s.name} ({s.durationMinutes}min)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelClass}>Título</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Ej: Corte de cabello"
              required
              className={inputClass}
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Hora</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className={labelClass}>Duración</label>
            <select
              value={form.durationMinutes}
              onChange={e => setForm(f => ({ ...f, durationMinutes: +e.target.value }))}
              className={inputClass}
            >
              {[15, 30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d} className="bg-pm-elevated">{d} min</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-pm-muted border border-pm-border rounded-lg hover:border-pm-gold hover:text-pm-text transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Creando..." : "Crear cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
