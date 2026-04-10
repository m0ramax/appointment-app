import { useState, useEffect } from "react";
import DatePickerLib from "react-datepicker";
import { format } from "date-fns";
import {
  appointmentService,
  type TimeSlot,
  type Provider,
} from "../../lib/api/appointments";
import "react-datepicker/dist/react-datepicker.css";

const DatePicker = DatePickerLib as any;

interface AppointmentCalendarProps {
  onAppointmentSelected?: (date: Date, timeSlot: TimeSlot, provider: Provider) => void;
}

export default function AppointmentCalendar({ onAppointmentSelected }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => { loadProviders(); }, []);

  useEffect(() => {
    if (selectedDate && selectedProvider) {
      loadAvailableSlots(selectedDate, selectedProvider.id);
    }
  }, [selectedDate, selectedProvider]);

  const loadProviders = async () => {
    setLoadingProviders(true);
    setError("");
    try {
      const providersList = await appointmentService.getProviders();
      setProviders(providersList);
      if (providersList.length > 0) setSelectedProvider(providersList[0]);
    } catch {
      setError("Error al cargar los proveedores");
    } finally {
      setLoadingProviders(false);
    }
  };

  const loadAvailableSlots = async (date: Date, providerId: number) => {
    setLoading(true);
    setError("");
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const slots = await appointmentService.getAvailableSlots(formattedDate, providerId);
      setAvailableSlots(slots);
    } catch {
      setError("Error al cargar los horarios disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!selectedDate || !selectedProvider || !timeSlot.available) return;
    onAppointmentSelected?.(selectedDate, timeSlot, selectedProvider);
  };

  const selectClass = "w-full px-3 py-2.5 border border-pm-border rounded-lg bg-pm-elevated text-pm-text text-sm focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-pm-muted mb-2";

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-5">
        <label className={labelClass}>Proveedor</label>
        {loadingProviders ? (
          <div className={`${selectClass} text-pm-dim`}>Cargando proveedores...</div>
        ) : (
          <select
            value={selectedProvider?.id || ""}
            onChange={(e) => {
              const provider = providers.find((p) => p.id === parseInt(e.target.value));
              setSelectedProvider(provider || null);
            }}
            className={selectClass}
          >
            <option value="" className="bg-pm-elevated">Selecciona un proveedor</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id} className="bg-pm-elevated">
                {provider.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-5">
        <label className={labelClass}>Fecha</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          disabled={!selectedProvider}
          className={`${selectClass} w-full`}
          placeholderText="Selecciona una fecha"
          wrapperClassName="w-full"
        />
      </div>

      {loading && (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-pm-border border-t-pm-gold mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm text-center mb-4 bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      {!loading && selectedDate && availableSlots.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-pm-muted mb-3">Horarios disponibles</h3>
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.start}
                onClick={() => handleTimeSlotClick(slot)}
                disabled={!slot.available}
                className={`py-2 text-sm rounded-lg font-medium transition-colors ${
                  slot.available
                    ? "border border-pm-gold text-pm-gold hover:bg-pm-gold hover:text-pm-bg"
                    : "border border-pm-border text-pm-dim cursor-not-allowed"
                }`}
              >
                {format(new Date(`2000-01-01T${slot.start}`), "HH:mm")}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && selectedDate && availableSlots.length === 0 && (
        <div className="text-center text-pm-muted text-sm py-6 bg-pm-elevated rounded-lg border border-pm-border">
          No hay horarios disponibles para esta fecha
        </div>
      )}
    </div>
  );
}
