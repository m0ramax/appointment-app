import { useState } from "react";
import { format } from "date-fns";
import { appointmentService, type TimeSlot, type Provider, type AppointmentCreate } from "../../lib/api/appointments";
import AppointmentCalendar from "../calendar/AppointmentCalendar";

export default function AppointmentForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [appointmentData, setAppointmentData] = useState({ title: "", description: "", duration_minutes: 60 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validatingAvailability, setValidatingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const validateAvailability = async (date: Date, timeSlot: TimeSlot, provider: Provider, duration: number) => {
    setValidatingAvailability(true);
    setAvailabilityMessage("");
    try {
      const [hours, minutes] = timeSlot.start.split(':').map(Number);
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      const result = await appointmentService.validateAvailability(provider.id, appointmentDateTime.toISOString(), duration);
      setAvailabilityMessage(result.available ? "✅ Horario disponible" : `❌ ${result.reason}`);
    } catch {
      setAvailabilityMessage("⚠️ Error verificando disponibilidad");
    } finally {
      setValidatingAvailability(false);
    }
  };

  const handleAppointmentSelected = async (date: Date, timeSlot: TimeSlot, provider: Provider) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setSelectedProvider(provider);
    setError("");
    setSuccess("");
    await validateAvailability(date, timeSlot, provider, appointmentData.duration_minutes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTimeSlot || !selectedProvider) {
      setError("Por favor selecciona fecha, hora y proveedor");
      return;
    }
    if (!appointmentData.title.trim()) {
      setError("Por favor ingresa un título para la cita");
      return;
    }
    if (availabilityMessage && !availabilityMessage.includes('✅')) {
      setError("El horario seleccionado no está disponible. Por favor selecciona otro horario.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const [hours, minutes] = selectedTimeSlot.start.split(':').map(Number);
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      const createData: AppointmentCreate = {
        title: appointmentData.title,
        description: appointmentData.description,
        date_time: appointmentDateTime.toISOString(),
        duration_minutes: appointmentData.duration_minutes,
        provider_id: selectedProvider.id,
      };
      await appointmentService.createAppointment(createData);
      setSuccess("¡Cita agendada exitosamente!");
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSelectedProvider(null);
      setAppointmentData({ title: "", description: "", duration_minutes: 60 });
      setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al agendar la cita. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2.5 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-pm-muted";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-pm-border">
            <h3 className="text-sm font-semibold text-pm-text">Seleccionar Fecha y Hora</h3>
          </div>
          <div className="p-5">
            <AppointmentCalendar onAppointmentSelected={handleAppointmentSelected} />
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-pm-border">
            <h3 className="text-sm font-semibold text-pm-text">Detalles de la Cita</h3>
          </div>
          <div className="p-5">
            {(selectedDate || selectedTimeSlot || selectedProvider) && (
              <div className="mb-5 p-4 bg-pm-gold-dim border border-pm-gold/20 rounded-lg">
                <h4 className="text-xs font-semibold text-pm-gold uppercase tracking-wider mb-2">Selección actual</h4>
                {selectedProvider && <p className="text-sm text-pm-muted"><span className="text-pm-text font-medium">Proveedor:</span> {selectedProvider.name}</p>}
                {selectedDate && <p className="text-sm text-pm-muted"><span className="text-pm-text font-medium">Fecha:</span> {format(selectedDate, "dd/MM/yyyy")}</p>}
                {selectedTimeSlot && <p className="text-sm text-pm-muted"><span className="text-pm-text font-medium">Hora:</span> {selectedTimeSlot.start} - {selectedTimeSlot.end}</p>}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className={labelClass}>Título de la Cita *</label>
                <input
                  type="text" id="title" required
                  className={inputClass}
                  placeholder="Ej: Consulta general, Revisión, etc."
                  value={appointmentData.title}
                  onChange={(e) => setAppointmentData({ ...appointmentData, title: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>Descripción (Opcional)</label>
                <textarea
                  id="description" rows={3}
                  className={inputClass}
                  placeholder="Detalles adicionales..."
                  value={appointmentData.description}
                  onChange={(e) => setAppointmentData({ ...appointmentData, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="duration" className={labelClass}>Duración</label>
                <select
                  id="duration"
                  className={inputClass}
                  value={appointmentData.duration_minutes}
                  onChange={async (e) => {
                    const newDuration = parseInt(e.target.value);
                    setAppointmentData({ ...appointmentData, duration_minutes: newDuration });
                    if (selectedDate && selectedTimeSlot && selectedProvider) {
                      await validateAvailability(selectedDate, selectedTimeSlot, selectedProvider, newDuration);
                    }
                  }}
                >
                  <option value={30} className="bg-pm-elevated">30 minutos</option>
                  <option value={60} className="bg-pm-elevated">1 hora</option>
                  <option value={90} className="bg-pm-elevated">1.5 horas</option>
                  <option value={120} className="bg-pm-elevated">2 horas</option>
                </select>
              </div>

              {selectedDate && selectedTimeSlot && selectedProvider && (
                <div className="bg-pm-elevated border border-pm-border p-3 rounded-lg text-sm">
                  {validatingAvailability ? (
                    <div className="flex items-center text-pm-muted">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-pm-border border-t-pm-gold mr-2"></div>
                      Verificando disponibilidad...
                    </div>
                  ) : availabilityMessage ? (
                    <div className={availabilityMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                      {availabilityMessage}
                    </div>
                  ) : null}
                </div>
              )}

              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 p-3 rounded-lg">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTimeSlot || !selectedProvider}
                className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light focus:outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-pm-bg/30 border-t-pm-bg mr-2"></div>
                    Agendando...
                  </div>
                ) : "Agendar Cita"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
