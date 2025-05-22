import { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { format } from "date-fns";
import { appointmentService, type TimeSlot } from "../../lib/api/appointments";
import "react-datepicker/dist/react-datepicker.css";

// Registrar el idioma español
registerLocale("es", es);

interface AppointmentCalendarProps {
  onAppointmentSelected?: (date: Date, timeSlot: TimeSlot) => void;
}

export default function AppointmentCalendar({
  onAppointmentSelected,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (date: Date) => {
    setLoading(true);
    setError("");
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const slots = await appointmentService.getAvailableSlots(formattedDate);
      setAvailableSlots(slots);
    } catch (err) {
      setError("Error al cargar los horarios disponibles");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (!selectedDate || !timeSlot.available) return;
    onAppointmentSelected?.(selectedDate, timeSlot);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona una fecha
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date) => setSelectedDate(date)}
          locale="es"
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholderText="Selecciona una fecha"
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm text-center mb-4">{error}</div>
      )}

      {!loading && selectedDate && availableSlots.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
