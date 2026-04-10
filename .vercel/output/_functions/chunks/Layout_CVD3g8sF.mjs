import { c as createComponent, e as createAstro, f as renderHead, r as renderComponent, g as renderSlot, d as addAttribute, a as renderTemplate } from './astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
/* empty css                                 */
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8000";
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
const safeStorage = {
  get: (key) => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn("Error accessing localStorage:", error);
    }
    return null;
  },
  set: (key, value) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn("Error setting localStorage:", error);
    }
  },
  remove: (key) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn("Error removing from localStorage:", error);
    }
  }
};
apiClient.interceptors.request.use((config) => {
  const token = safeStorage.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
const authService = {
  async login(credentials) {
    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);
    try {
      const response = await apiClient.post(
        "/api/v1/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
      safeStorage.set("token", response.data.access_token);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  async register(credentials) {
    try {
      const response = await apiClient.post(
        "/api/v1/register",
        credentials
      );
      return response.data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },
  async logout() {
    safeStorage.remove("token");
  },
  async getProfile() {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }
      const response = await apiClient.get("/api/v1/me");
      return response.data;
    } catch (error) {
      console.error("Get profile error:", error);
      return null;
    }
  },
  isAuthenticated() {
    try {
      return !!safeStorage.get("token");
    } catch (error) {
      return false;
    }
  }
};

function Navigation() {
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
  return /* @__PURE__ */ jsxs("nav", { className: "bg-pm-surface border-b border-pm-border", children: [
    /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between h-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 flex items-center", children: /* @__PURE__ */ jsx("a", { href: "/", className: "text-xl font-bold text-pm-gold tracking-tight", children: "TurnosPro" }) }),
        /* @__PURE__ */ jsxs("div", { className: "hidden sm:ml-8 sm:flex sm:space-x-6", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/",
              className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-pm-muted hover:text-pm-text border-b-2 border-transparent hover:border-pm-gold transition-colors",
              children: "Inicio"
            }
          ),
          isLoggedIn && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "/appointments/new",
                className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-pm-muted hover:text-pm-text border-b-2 border-transparent hover:border-pm-gold transition-colors",
                children: "Agendar Cita"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "/dashboard",
                className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-pm-muted hover:text-pm-text border-b-2 border-transparent hover:border-pm-gold transition-colors",
                children: "Mis Citas"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden sm:ml-6 sm:flex sm:items-center space-x-4", children: isLoggedIn ? /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleLogout,
          className: "inline-flex items-center px-4 py-2 border border-pm-border text-sm font-medium rounded-lg text-pm-muted hover:text-pm-text hover:border-pm-gold transition-colors",
          children: "Cerrar Sesión"
        }
      ) : /* @__PURE__ */ jsx(
        "a",
        {
          href: "/auth/login",
          className: "inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors",
          children: "Iniciar Sesión"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "-mr-2 flex items-center sm:hidden", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setIsMenuOpen(!isMenuOpen),
          className: "inline-flex items-center justify-center p-2 rounded-md text-pm-muted hover:text-pm-text hover:bg-pm-elevated focus:outline-none transition-colors",
          children: [
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Abrir menú principal" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `${isMenuOpen ? "hidden" : "block"} h-6 w-6`,
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" })
              }
            ),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `${isMenuOpen ? "block" : "hidden"} h-6 w-6`,
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
              }
            )
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: `${isMenuOpen ? "block" : "hidden"} sm:hidden border-t border-pm-border`, children: /* @__PURE__ */ jsxs("div", { className: "pt-2 pb-3 space-y-1 bg-pm-surface", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors",
          children: "Inicio"
        }
      ),
      isLoggedIn && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/appointments/new",
            className: "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors",
            children: "Agendar Cita"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/dashboard",
            className: "block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors",
            children: "Mis Citas"
          }
        )
      ] }),
      isLoggedIn ? /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleLogout,
          className: "block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-pm-muted hover:text-pm-text hover:bg-pm-elevated hover:border-pm-gold transition-colors",
          children: "Cerrar Sesión"
        }
      ) : /* @__PURE__ */ jsx(
        "a",
        {
          href: "/auth/login",
          className: "block pl-3 pr-4 py-2 border-l-4 border-pm-gold text-base font-medium text-pm-gold bg-pm-elevated",
          children: "Iniciar Sesión"
        }
      )
    ] }) })
  ] });
}

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description } = Astro2.props;
  return renderTemplate`<html lang="es" class="dark" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} - TurnosPro</title>${description && renderTemplate`<meta name="description"${addAttribute(description, "content")}>`}<link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderHead()}</head> <body class="min-h-screen bg-pm-bg text-pm-text antialiased" data-astro-cid-sckkx6r4> ${renderComponent($$result, "Navigation", Navigation, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/components/layout/Navigation", "client:component-export": "default", "data-astro-cid-sckkx6r4": true })} ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/layouts/Layout.astro", void 0);

export { $$Layout as $, authService as a, apiClient as b };
