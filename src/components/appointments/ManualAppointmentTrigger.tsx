import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import ManualAppointmentModal from "./ManualAppointmentModal";

export default function ManualAppointmentTrigger() {
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    authService.getProfile().then(user => {
      if (user?.role?.toUpperCase() === "OWNER" && user.businessId) {
        setBusinessId(user.businessId);
      }
    }).catch(() => {});
  }, []);

  if (!businessId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-pm-border rounded-lg text-sm font-medium text-pm-muted hover:text-pm-text hover:border-pm-gold transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nueva Cita
      </button>

      {open && (
        <ManualAppointmentModal
          businessId={businessId}
          onClose={() => setOpen(false)}
          onCreated={() => { setOpen(false); window.location.reload(); }}
        />
      )}
    </>
  );
}
