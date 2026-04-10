/* empty css                                            */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { a as authService, $ as $$Layout } from '../../chunks/Layout_CVD3g8sF.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../../renderers.mjs';

function LoginForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.login(credentials);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    } catch {
      setError("Error al iniciar sesión. Por favor, verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };
  const inputClass = "appearance-none block w-full px-4 py-3 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors text-sm";
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center py-12 px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-pm-gold tracking-tight", children: "TurnosPro" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-pm-muted text-sm", children: "Inicia sesión en tu cuenta" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-pm-muted mb-1", children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "email",
            name: "email",
            type: "email",
            required: true,
            className: inputClass,
            placeholder: "correo@ejemplo.com",
            value: credentials.email,
            onChange: (e) => setCredentials({ ...credentials, email: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-pm-muted mb-1", children: "Contraseña" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            required: true,
            className: inputClass,
            placeholder: "••••••••",
            value: credentials.password,
            onChange: (e) => setCredentials({ ...credentials, password: e.target.value })
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "text-red-400 text-sm bg-red-400/10 border border-red-400/20 p-3 rounded-lg", children: error }),
      /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light focus:outline-none transition-all disabled:opacity-50",
          children: loading ? "Iniciando sesión..." : "Iniciar sesión"
        }
      ) })
    ] })
  ] }) });
}

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Iniciar Sesi\xF3n", "description": "Inicia sesi\xF3n en el sistema de agendamiento para gestionar tus citas." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen py-12"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="max-w-md mx-auto"> ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/components/auth/LoginForm.tsx", "client:component-export": "default" })} </div> </div> </main> ` })}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/auth/login.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/auth/login.astro";
const $$url = "/auth/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
