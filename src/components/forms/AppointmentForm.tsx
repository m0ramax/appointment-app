import { useState } from "react";
import { format } from "date-fns";
import { appointmentService, type TimeSlot, type Provider, type AppointmentCreate } from "../../lib/api/appointments";
import AppointmentCalendar from "../calendar/AppointmentCalendar";

export default function AppointmentForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [appointmentData, setAppointmentData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validatingAvailability, setValidatingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  // Function to validate availability in real-time
  const validateAvailability = async (date: Date, timeSlot: TimeSlot, provider: Provider, duration: number) => {
    setValidatingAvailability(true);
    setAvailabilityMessage("");
    
    try {
      const [hours, minutes] = timeSlot.start.split(':').map(Number);
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const result = await appointmentService.validateAvailability(
        provider.id,
        appointmentDateTime.toISOString(),
        duration
      );
      
      if (result.available) {
        setAvailabilityMessage("✅ Horario disponible");
      } else {
        setAvailabilityMessage(`❌ ${result.reason}`);
      }
    } catch (error) {
      console.error("Error validating availability:", error);
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
    
    // Validate availability immediately
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

    // Check if slot is still available before submitting
    if (availabilityMessage && !availabilityMessage.includes('✅')) {
      setError("El horario seleccionado no está disponible. Por favor selecciona otro horario.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Combine date and time
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
      
      // Reset form
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSelectedProvider(null);
      setAppointmentData({
        title: "",
        description: "",
        duration_minutes: 60,
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);

    } catch (err: any) {
      console.error("Error creating appointment:", err);
      setError(
        err.response?.data?.detail || "Error al agendar la cita. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Seleccionar Fecha y Hora
            </h3>
          </div>
          <div className="p-6">
            <AppointmentCalendar 
              onAppointmentSelected={handleAppointmentSelected}
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Detalles de la Cita
            </h3>
          </div>
          <div className="p-6">
            {/* Selection Summary */}
            {(selectedDate || selectedTimeSlot || selectedProvider) && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Selección Actual:
                </h4>
                {selectedProvider && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Proveedor:</strong> {selectedProvider.name}
                  </p>
                )}
                {selectedDate && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Fecha:</strong> {format(selectedDate, "dd/MM/yyyy")}
                  </p>
                )}
                {selectedTimeSlot && (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Hora:</strong> {selectedTimeSlot.start} - {selectedTimeSlot.end}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título de la Cita *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: Consulta general, Revisión, etc."
                  value={appointmentData.title}
                  onChange={(e) => setAppointmentData({
                    ...appointmentData,
                    title: e.target.value
                  })}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción (Opcional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Detalles adicionales sobre la cita..."
                  value={appointmentData.description}
                  onChange={(e) => setAppointmentData({
                    ...appointmentData,
                    description: e.target.value
                  })}
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duración (minutos)
                </label>
                <select
                  id="duration"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={appointmentData.duration_minutes}
                  onChange={async (e) => {
                    const newDuration = parseInt(e.target.value);
                    setAppointmentData({
                      ...appointmentData,
                      duration_minutes: newDuration
                    });
                    
                    // Re-validate availability with new duration
                    if (selectedDate && selectedTimeSlot && selectedProvider) {
                      await validateAvailability(selectedDate, selectedTimeSlot, selectedProvider, newDuration);
                    }
                  }}
                >
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1.5 horas</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>

              {/* Availability Status */}
              {selectedDate && selectedTimeSlot && selectedProvider && (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <div className="text-sm">
                    {validatingAvailability ? (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                        Verificando disponibilidad...
                      </div>
                    ) : availabilityMessage ? (
                      <div className={`${availabilityMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {availabilityMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTimeSlot || !selectedProvider}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Agendando...
                  </>
                ) : (
                  "Agendar Cita"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}