/* empty css                                         */
import { c as createComponent, r as renderComponent, b as renderScript, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CVD3g8sF.mjs';
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Iniciar Sesi\xF3n", "description": "Accede a tu cuenta" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8"> <!-- Logo / Brand --> <div class="text-center"> <h1 class="text-4xl font-bold text-pm-gold tracking-tight">TurnosPro</h1> <p class="mt-2 text-pm-muted text-sm">Accede a tu sistema de citas</p> </div> <!-- Error Message --> <div id="error-message" class="hidden bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg" role="alert"> <span class="block sm:inline" id="error-text"></span> </div> <!-- Success Message --> <div id="success-message" class="hidden bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg" role="alert"> <span class="block sm:inline">¡Login exitoso! Redirigiendo...</span> </div> <form id="login-form" class="mt-8 space-y-4"> <div> <label for="email" class="block text-sm font-medium text-pm-muted mb-1">Email</label> <input id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-4 py-3 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors" placeholder="correo@ejemplo.com"> </div> <div> <label for="password" class="block text-sm font-medium text-pm-muted mb-1">Contraseña</label> <input id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none block w-full px-4 py-3 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors" placeholder="••••••••"> </div> <div class="pt-2"> <button type="submit" id="login-button" class="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"> <span id="login-text">Iniciar sesión</span> </button> </div> <div class="text-center"> <a href="/register" class="text-sm text-pm-muted hover:text-pm-gold transition-colors underline underline-offset-2">
¿No tienes cuenta? Crear cuenta
</a> </div> <!-- Demo Accounts --> <div class="mt-6 border-t border-pm-border pt-5"> <h3 class="text-xs font-medium text-pm-dim uppercase tracking-widest mb-3">Cuentas de prueba</h3> <div class="space-y-2 text-sm text-pm-muted"> <div class="flex justify-between items-center bg-pm-elevated rounded-lg px-3 py-2"> <span><span class="text-pm-gold font-medium">Cliente:</span> test@example.com</span> <button type="button" onclick="fillDemoClient()" class="text-pm-gold hover:text-pm-gold-light text-xs font-medium transition-colors">
Usar
</button> </div> <div class="flex justify-between items-center bg-pm-elevated rounded-lg px-3 py-2"> <span><span class="text-pm-gold font-medium">Proveedor:</span> provider@example.com</span> <button type="button" onclick="fillDemoProvider()" class="text-pm-gold hover:text-pm-gold-light text-xs font-medium transition-colors">
Usar
</button> </div> <p class="text-pm-dim text-xs text-center">Contraseña: <code class="text-pm-muted bg-pm-elevated px-1.5 py-0.5 rounded">password123</code></p> </div> </div> </form> </div> </main> ` })} ${renderScript($$result, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/login.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
