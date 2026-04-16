export interface ConfirmModalState {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "danger" | "warning";
  onConfirm: () => void;
}

interface Props {
  modal: ConfirmModalState;
  onCancel: () => void;
}

export default function ConfirmModal({ modal, onCancel }: Props) {
  const btnClass =
    modal.variant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "bg-yellow-500 hover:bg-yellow-600 text-pm-bg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-pm-surface border border-pm-border rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-base font-semibold text-pm-text mb-2">{modal.title}</h3>
        <p className="text-sm text-pm-muted mb-6">{modal.message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-pm-border rounded-lg text-pm-muted hover:text-pm-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={modal.onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${btnClass}`}
          >
            {modal.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
