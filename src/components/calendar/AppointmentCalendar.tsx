import { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { format } from "date-fns";
import { appointmentService, type TimeSlot, type Provider } from "../../lib/api/appointments";
import "react-datepicker/dist/react-datepicker.css";

// Registrar el idioma español
registerLocale("es", es);

interface AppointmentCalendarProps {
  onAppointmentSelected?: (date: Date, timeSlot: TimeSlot, provider: Provider) => void;
}

export default function AppointmentCalendar({
  onAppointmentSelected,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadProviders();
  }, []);

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
      if (providersList.length > 0) {
        setSelectedProvider(providersList[0]); // Select first provider by default
      }
    } catch (err) {
      setError("Error al cargar los proveedores");
      console.error(err);
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
    } catch (err) {
      setError("Error al cargar los horarios disponibles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!selectedDate || !selectedProvider || !timeSlot.available) return;
    onAppointmentSelected?.(selectedDate, timeSlot, selectedProvider);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selecciona un proveedor
        </label>
        {loadingProviders ? (
          <div className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            Cargando proveedores...
          </div>
        ) : (
          <select
            value={selectedProvider?.id || ""}
            onChange={(e) => {
              const providerId = parseInt(e.target.value);
              const provider = providers.find(p => p.id === providerId);
              setSelectedProvider(provider || null);
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecciona un proveedor</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selecciona una fecha
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          locale="es"
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          disabled={!selectedProvider}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          placeholderText="Selecciona una fecha"
        />
      </div>

      {loading && (
        <div className="text-center py-4 text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">{error}</div>
      )}

      {!loading && selectedDate && availableSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Horarios disponibles
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.start}
                onClick={() => handleTimeSlotClick(slot)}
                disabled={!slot.available}
                className={`p-2 text-sm rounded-md transition-colors ${
                  slot.available
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                {format(new Date(`2000-01-01T${slot.start}`), "HH:mm")}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && selectedDate && availableSlots.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No hay horarios disponibles para esta fecha
        </div>
      )}
    </div>
  );
}
