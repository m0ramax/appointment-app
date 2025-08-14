import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { appointmentService, type Appointment } from "../../lib/api/appointments";

interface AppointmentListProps {
  userRole?: "client" | "provider";
}

export default function AppointmentList({ userRole = "client" }: AppointmentListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const userAppointments = await appointmentService.getUserAppointments();
      setAppointments(userAppointments);
    } catch (err: any) {
      console.error("Error loading appointments:", err);
      setError("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
    try {
      switch (newStatus) {
        case 'confirmed':
          await appointmentService.confirmAppointment(appointmentId);
          break;
        case 'completed':
          await appointmentService.completeAppointment(appointmentId);
          break;
        case 'cancelled':
          await appointmentService.cancelAppointmentByStatus(appointmentId);
          break;
        default:
          await appointmentService.updateAppointment(appointmentId, { status: newStatus as any });
      }
      // Reload appointments after update
      await loadAppointments();
    } catch (err: any) {
      console.error("Error updating appointment:", err);
      
      let errorMessage = "Error al actualizar la cita";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setError(errorMessage);
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) {
      return;
    }

    try {
      await appointmentService.cancelAppointmentByStatus(appointmentId);
      await loadAppointments();
    } catch (err: any) {
      console.error("Error canceling appointment:", err);
      
      let errorMessage = "Error al cancelar la cita";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setError(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando citas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          {error}
        </div>
        <button
          onClick={loadAppointments}
          className="mt-4 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay citas</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {userRole === "client" 
              ? "Aún no has agendado ninguna cita." 
              : "No tienes citas asignadas."}
          </p>
          {userRole === "client" && (
            <div className="mt-6">
              <a
                href="/appointments/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Agendar Primera Cita
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {userRole === "client" ? "Mis Citas" : "Citas Asignadas"}
        </h2>
        <button
          onClick={loadAppointments}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          Actualizar
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700 overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                      {appointment.title}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>
                        {format(new Date(appointment.date_time), "PPP 'a las' p", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>Duración: {appointment.duration_minutes} minutos</p>
                    </div>
                  </div>
                  {appointment.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.description}</p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex-shrink-0 flex space-x-2">
                  {/* Enhanced actions based on role and status */}
                  {userRole === "provider" && appointment.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "confirmed")}
                        className="px-3 py-1 bg-green-600 dark:bg-green-500 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                        title="Confirmar cita"
                      >
                        ✓ Confirmar
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                        className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                        title="Rechazar cita"
                      >
                        ✗ Rechazar
                      </button>
                    </>
                  )}

                  {userRole === "provider" && appointment.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "completed")}
                        className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        title="Marcar como completada"
                      >
                        ✓ Completar
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                        className="px-3 py-1 bg-gray-600 dark:bg-gray-500 text-white text-sm rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        title="Cancelar cita"
                      >
                        ✗ Cancelar
                      </button>
                    </>
                  )}

                  {userRole === "client" && appointment.status === "pending" && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                      title="Cancelar cita"
                    >
                      ✗ Cancelar
                    </button>
                  )}

                  {userRole === "client" && appointment.status === "confirmed" && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="px-3 py-1 bg-orange-600 dark:bg-orange-500 text-white text-sm rounded-md hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors"
                      title="Cancelar cita confirmada"
                    >
                      ✗ Cancelar
                    </button>
                  )}

                  {appointment.status === "cancelled" && (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm rounded-md flex items-center">
                      ✗ Cancelada
                    </span>
                  )}

                  {appointment.status === "completed" && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-md flex items-center">
                      ✓ Completada
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}