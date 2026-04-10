import { useState } from "react";
import { authService, type LoginCredentials } from "../../lib/api/auth";
import { APP_NAME } from "../../config/app";

export default function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(credentials);
      setTimeout(() => { window.location.href = "/dashboard"; }, 100);
    } catch {
      setError("Error al iniciar sesión. Por favor, verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "appearance-none block w-full px-4 py-3 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pm-gold tracking-tight">{APP_NAME}</h1>
          <p className="mt-2 text-pm-muted text-sm">Inicia sesión en tu cuenta</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-pm-muted mb-1">Email</label>
            <input
              id="email" name="email" type="email" required
              className={inputClass}
              placeholder="correo@ejemplo.com"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-pm-muted mb-1">Contraseña</label>
            <input
              id="password" name="password" type="password" required
              className={inputClass}
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
