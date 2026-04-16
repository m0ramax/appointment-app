import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import { businessService, type BotStatus } from "../../lib/api/business";

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
const WEBHOOK_URL = `${API_URL}/webhook/whatsapp`;
const VERIFY_TOKEN = "tucita_verify_token";

function formatLastActivity(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  const diffMs = now.getTime() - then.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) return `hace ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  return `hace ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
}

function validateWhatsappNumber(value: string): string | null {
  if (!value.startsWith("+")) return "El numero debe comenzar con +";
  const digits = value.slice(1);
  if (!/^\d+$/.test(digits)) return "Solo se permiten digitos despues del +";
  if (digits.length < 7) return "Numero demasiado corto";
  return null;
}

export default function BotStatusPanel() {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function init() {
      const user = await authService.getProfile();
      if (!user || user.role?.toUpperCase() !== "OWNER") {
        setLoading(false);
        return;
      }
      setIsOwner(true);
      try {
        const data = await businessService.getBotStatus();
        setStatus(data);
      } catch {
        setFetchError("No se pudo cargar el estado del bot.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading || !isOwner) return null;

  if (fetchError) {
    return (
      <div className="bg-pm-surface border border-pm-border rounded-xl p-5 mt-8">
        <p className="text-sm text-red-400">{fetchError}</p>
      </div>
    );
  }

  if (!status) return null;

  function startEditing() {
    setInputValue(status?.whatsappNumber ?? "");
    setValidationError(null);
    setSaveError(null);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setValidationError(null);
    setSaveError(null);
  }

  async function handleSave() {
    const error = validateWhatsappNumber(inputValue.trim());
    if (error) {
      setValidationError(error);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await businessService.updateWhatsappNumber(inputValue.trim());
      const updated = await businessService.getBotStatus();
      setStatus(updated);
      setEditing(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 409) {
        setSaveError("Este numero ya esta en uso por otro negocio.");
      } else {
        setSaveError("Error al guardar. Intenta de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(WEBHOOK_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <div className="mt-8 bg-pm-surface border border-pm-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-pm-text">Bot de WhatsApp</h2>
          <p className="text-sm text-pm-muted mt-0.5">
            Configuracion del agendamiento automatico por WhatsApp
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            status.configured
              ? "bg-green-400/10 text-green-400 border border-green-400/20"
              : "bg-pm-elevated text-pm-dim border border-pm-border"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${status.configured ? "bg-green-400" : "bg-pm-dim"}`}
          />
          {status.configured ? "Número registrado" : "Sin configurar"}
        </span>
      </div>

      <div className="space-y-6">
        {/* WhatsApp number row */}
        <div>
          <p className="text-xs font-medium text-pm-dim uppercase tracking-wider mb-2">
            Numero de WhatsApp Business
          </p>

          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setValidationError(null);
                    setSaveError(null);
                  }}
                  placeholder="+5491122334455"
                  className="flex-1 bg-pm-bg border border-pm-border rounded-lg px-3 py-2 text-sm text-pm-text placeholder:text-pm-dim focus:outline-none focus:border-pm-gold transition-colors"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-pm-border text-pm-muted hover:text-pm-text hover:border-pm-gold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
              {validationError && (
                <p className="text-xs text-red-400">{validationError}</p>
              )}
              {saveError && (
                <p className="text-xs text-red-400">{saveError}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-pm-text font-mono">
                {status.whatsappNumber ?? (
                  <span className="text-pm-dim italic">Sin configurar</span>
                )}
              </span>
              <button
                onClick={startEditing}
                className="text-xs text-pm-muted hover:text-pm-gold transition-colors border border-pm-border hover:border-pm-gold rounded px-2 py-0.5"
              >
                Editar
              </button>
            </div>
          )}

          {/* Last activity */}
          {!editing && (
            <p className="text-xs text-pm-dim mt-2">
              {status.lastActivity
                ? `Ultimo mensaje: ${formatLastActivity(status.lastActivity)}`
                : status.configured
                ? "Sin actividad reciente"
                : "Configura tu numero de WhatsApp Business para activar el bot de agendamiento automatico."}
            </p>
          )}
        </div>

        {/* Webhook instructions — only when configured */}
        {status.configured && (
          <div className="border-t border-pm-border pt-5">
            <p className="text-xs font-medium text-pm-dim uppercase tracking-wider mb-3">
              Configuracion del webhook
            </p>
            <p className="text-sm text-pm-muted mb-3">
              Apunta el webhook de tu cuenta de WhatsApp Business (Meta) a esta URL:
            </p>

            {/* Webhook URL copy box */}
            <div className="flex items-center gap-2 bg-pm-bg border border-pm-border rounded-lg px-3 py-2 mb-4">
              <code className="flex-1 text-xs text-pm-text font-mono break-all">
                {WEBHOOK_URL}
              </code>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-xs text-pm-muted hover:text-pm-gold transition-colors border border-pm-border hover:border-pm-gold rounded px-2 py-0.5"
              >
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>

            {/* Steps */}
            <ol className="space-y-2 text-sm text-pm-muted list-none">
              <li className="flex gap-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-pm-elevated text-pm-dim text-xs flex items-center justify-center font-medium">
                  1
                </span>
                <span>
                  Ve a Meta for Developers &rarr; tu app &rarr; WhatsApp &rarr; Configuracion
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-pm-elevated text-pm-dim text-xs flex items-center justify-center font-medium">
                  2
                </span>
                <span>
                  En <strong className="text-pm-text font-medium">URL de webhook</strong> pega la URL de arriba
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-pm-elevated text-pm-dim text-xs flex items-center justify-center font-medium">
                  3
                </span>
                <span>
                  En <strong className="text-pm-text font-medium">Token de verificacion</strong> usa:{" "}
                  <code className="text-xs font-mono text-pm-gold">{VERIFY_TOKEN}</code>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-pm-elevated text-pm-dim text-xs flex items-center justify-center font-medium">
                  4
                </span>
                <span>
                  Suscribete al campo{" "}
                  <code className="text-xs font-mono text-pm-gold">messages</code>
                </span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
