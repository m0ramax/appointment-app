import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import { APP_NAME } from "../../config/app";
import ThemeToggle from "./ThemeToggle";

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(authService.isAuthenticated());
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    window.location.href = "/auth/login";
  };

  return (
    <nav className="bg-pm-surface border-b border-pm-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="text-xl font-bold text-pm-gold tracking-tight">
                {APP_NAME}
              </a>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <a
                href="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-pm-muted hover:text-pm-text border-b-2 border-transparent hover:border-pm-gold transition-colors"
              >
                Inicio
              </a>
              {isLoggedIn && (
                <>
                  <a
                    href="/appointments/new"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-pm-muted hover:text-pm-text border-b-2 border-transparent hover:border-pm-gold transition-colors"
                  >
                    Agendar Cita
                  </a>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-pm-muted hover:text-pm-text border-b-2 border-transparent hover:border-pm-gold transition-colors"
                  >
                    Mis Citas
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            <ThemeToggle />
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-pm-border text-sm font-medium rounded-lg text-pm-muted hover:text-pm-text hover:border-pm-gold transition-colors"
              >
                Cerrar Sesión
              </button>
            ) : (
              <a
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors"
              >
                Iniciar Sesión
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-pm-border text-sm font-medium rounded-lg text-pm-muted hover:text-pm-text hover:border-pm-gold transition-colors"
              >
                Salir
              </button>
            ) : (
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors"
              >
                Iniciar Sesión
              </a>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}
