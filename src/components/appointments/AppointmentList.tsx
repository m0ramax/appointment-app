import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { appointmentService, type AppointmentWithParties } from "../../lib/api/appointments";
import { authService } from "../../lib/api/auth";
import { workScheduleService, type TeamMember } from "../../lib/api/work-schedule";
import { PROVIDER_COLORS } from "../../lib/providerColors";
import ConfirmModal, { type ConfirmModalState } from "../ui/ConfirmModal";

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getDate().toString().padStart(2,"0")}`;
}

export default function AppointmentList() {
  const [role, setRole] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithParties[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [modal, setModal] = useState<ConfirmModalState | null>(null);

  useEffect(() => {
    authService.getProfile()
      .then(async user => {
        if (!user) return;
        const r = user.role?.toUpperCase() ?? "CLIENT";
        setRole(r);
        if (r === "OWNER") {
          const members = await workScheduleService.getTeam();
          setTeam(members);
        }
      })
      .catch(() => setRole("CLIENT"));
  }, []);

  useEffect(() => { if (role) loadAppointments(); }, [role]);

  useEffect(() => {
    const handler = () => loadAppointments();
    window.addEventListener("appointment-updated", handler);
    return () => window.removeEventListener("appointment-updated", handler);
  }, [role]);

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      let data: AppointmentWithParties[];
      if (role === "OWNER") {
        const today = new Date();
        const end = new Date(today);
        end.setDate(end.getDate() + 30);
        data = await appointmentService.getBusinessAppointmentsForWeek(toDateStr(today), toDateStr(end));
      } else {
        data = await appointmentService.getUserAppointments() as AppointmentWithParties[];
      }
      setAppointments(data);
    } catch (err: any) {
      setError("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
    try {
      switch (newStatus) {
        case 'CONFIRMED': await appointmentService.confirmAppointment(appointmentId); break;
        case 'COMPLETED': await appointmentService.completeAppointment(appointmentId); break;
        case 'CANCELLED': await appointmentService.cancelAppointment(appointmentId); break;
        default: await appointmentService.updateAppointment(appointmentId, { status: newStatus as any });
      }
      await loadAppointments();
      window.dispatchEvent(new CustomEvent("appointment-updated"));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar la cita");
    }
  };

  const handleCancelAppointment = (appointmentId: number) => {
    setModal({
      title: "Cancelar cita",
      message: "¿Estás seguro de que quieres cancelar esta cita?",
      confirmLabel: "Cancelar cita",
      variant: "warning",
      onConfirm: async () => {
        setModal(null);
        try {
          await appointmentService.cancelAppointment(appointmentId);
          await loadAppointments();
          window.dispatchEvent(new CustomEvent("appointment-updated"));
        } catch (err: any) {
          setError(err.response?.data?.message || "Error al cancelar la cita");
        }
      },
    });
  };

  const handleDelete = (appointmentId: number) => {
    setModal({
      title: "Eliminar cita",
      message: "Esta acción es permanente y no se puede deshacer.",
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        setModal(null);
        try {
          await appointmentService.deleteAppointment(appointmentId);
          await loadAppointments();
          window.dispatchEvent(new CustomEvent("appointment-updated"));
        } catch (err: any) {
          setError(err.response?.data?.message || "Error al eliminar la cita");
        }
      },
    });
  };

  const isOwner    = role === "OWNER";
  const isProvider = role === "PROVIDER" || isOwner;

  const providerColor = (providerId: number) => {
    const idx = team.findIndex(m => m.id === providerId);
    return PROVIDER_COLORS[(idx >= 0 ? idx : 0) % PROVIDER_COLORS.length];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":   return "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20";
      case "CONFIRMED": return "bg-green-400/10 text-green-400 border border-green-400/20";
      case "CANCELLED": return "bg-red-400/10 text-red-400 border border-red-400/20";
      case "COMPLETED": return "bg-blue-400/10 text-blue-400 border border-blue-400/20";
      default:          return "bg-pm-elevated text-pm-muted border border-pm-border";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":   return "Pendiente";
      case "CONFIRMED": return "Confirmada";
      case "CANCELLED": return "Cancelada";
      case "COMPLETED": return "Completada";
      default: return status;
    }
  };


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pm-border border-t-pm-gold mx-auto"></div>
        <p className="mt-4 text-pm-muted text-sm">Cargando citas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-lg">
          {error}
        </div>
        <button
          onClick={loadAppointments}
          className="mt-4 px-4 py-2 bg-pm-gold text-pm-bg text-sm font-semibold rounded-lg hover:bg-pm-gold-light transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 bg-pm-surface border border-pm-border rounded-xl">
        <svg className="mx-auto h-12 w-12 text-pm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-3 text-base font-medium text-pm-text">No hay citas</h3>
        <p className="mt-1 text-sm text-pm-muted">
          {isProvider ? (isOwner ? "No hay citas en los próximos 30 días." : "No tienes citas asignadas.") : "Aún no has agendado ninguna cita."}
        </p>
        {!isProvider && (
          <div className="mt-6">
            <a
              href="/appointments/new"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors"
            >
              Agendar Primera Cita
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
    {modal && <ConfirmModal modal={modal} onCancel={() => setModal(null)} />}
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-pm-text">
          {isOwner ? "Citas del Negocio (próximos 30 días)" : isProvider ? "Citas Asignadas" : "Mis Citas"}
        </h2>
        <button
          onClick={loadAppointments}
          className="text-sm text-pm-muted hover:text-pm-gold transition-colors"
        >
          Actualizar
        </button>
      </div>

      <div className="bg-pm-surface border border-pm-border rounded-xl overflow-hidden">
        <ul className="divide-y divide-pm-border">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="px-5 py-4 hover:bg-pm-elevated/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm font-semibold text-pm-text truncate">
                      {appointment.title}
                    </p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getStatusBadge(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-xs text-pm-muted">
                      <svg className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-pm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(appointment.dateTime), "PPP 'a las' p", { locale: es })}
                    </div>
                    <div className="flex items-center text-xs text-pm-muted">
                      <svg className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-pm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {appointment.durationMinutes} min
                    </div>
                    {isOwner && appointment.provider && (
                      <div className="flex items-center text-xs text-pm-muted">
                        <svg className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-pm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-pm-dim mr-1">Proveedor:</span>
                        <span className={`font-medium ${providerColor(appointment.providerId).label}`}>
                          {appointment.provider.email.split("@")[0]}
                        </span>
                      </div>
                    )}
                    {isProvider && appointment.client && (
                      <div className="flex items-center text-xs text-pm-muted">
                        <svg className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-pm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-pm-dim mr-1">Cliente:</span>
                        {appointment.client.email.split("@")[0]}
                      </div>
                    )}
                  </div>
                  {appointment.description && (
                    <p className="mt-1 text-xs text-pm-dim">{appointment.description}</p>
                  )}
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  {isOwner && (
                    <>
                      {appointment.status === "PENDING" && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "CONFIRMED")}
                          className="px-3 py-1.5 bg-green-600/80 hover:bg-green-600 text-white text-xs font-medium rounded-lg border border-green-600/30 transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      {appointment.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "COMPLETED")}
                          className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium rounded-lg border border-blue-600/30 transition-colors"
                        >
                          Completar
                        </button>
                      )}
                      {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleStatusUpdate(appointment.id, "CANCELLED")}
                          className="px-3 py-1.5 bg-pm-elevated hover:bg-pm-border text-pm-muted text-xs font-medium rounded-lg border border-pm-border transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium rounded-lg border border-red-600/30 transition-colors"
                      >
                        Eliminar
                      </button>
                    </>
                  )}

                  {!isOwner && role === "PROVIDER" && appointment.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "CONFIRMED")}
                        className="px-3 py-1.5 bg-green-600/80 hover:bg-green-600 text-white text-xs font-medium rounded-lg border border-green-600/30 transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "CANCELLED")}
                        className="px-3 py-1.5 bg-red-600/70 hover:bg-red-600 text-white text-xs font-medium rounded-lg border border-red-600/30 transition-colors"
                      >
                        Rechazar
                      </button>
                    </>
                  )}

                  {!isOwner && role === "PROVIDER" && appointment.status === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "COMPLETED")}
                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium rounded-lg border border-blue-600/30 transition-colors"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, "CANCELLED")}
                        className="px-3 py-1.5 bg-pm-elevated hover:bg-pm-border text-pm-muted text-xs font-medium rounded-lg border border-pm-border transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {role === "CLIENT" && (appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="px-3 py-1.5 bg-red-600/70 hover:bg-red-600 text-white text-xs font-medium rounded-lg border border-red-600/30 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}
