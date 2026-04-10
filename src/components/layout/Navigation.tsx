import { useState, useEffect } from "react";
import { authService } from "../../lib/api/auth";
import { APP_NAME } from "../../config/app";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <nav className="bg-pm-surface border-b border-pm-border">
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
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
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
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-pm-muted hover:text-pm-text hover:bg-pm-elevated focus:outline-none transition-colors"
            >
              <span className="sr-only">Abrir menú principal</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} sm:hidden border-t border-pm-border`}>
        <div className="pt-2 pb-3 space-y-1 bg-pm-surface">
          <a
            href="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors"
          >
            Inicio
          </a>
          {isLoggedIn && (
            <>
              <a
                href="/appointments/new"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors"
              >
                Agendar Cita
              </a>
              <a
                href="/dashboard"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors"
              >
                Mis Citas
              </a>
            </>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors"
            >
              Cerrar Sesión
            </button>
          ) : (
            <a
              href="/auth/login"
              className="block pl-3 pr-4 py-2 border-l-4 border-pm-gold text-base font-medium text-pm-gold bg-pm-elevated"
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
