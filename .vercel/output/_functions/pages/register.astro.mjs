/* empty css                                         */
import { c as createComponent, r as renderComponent, b as renderScript, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CVD3g8sF.mjs';
export { renderers } from '../renderers.mjs';

const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Registro", "description": "Crea tu cuenta" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8"> <!-- Brand --> <div class="text-center"> <h1 class="text-4xl font-bold text-pm-gold tracking-tight">TurnosPro</h1> <p class="mt-2 text-pm-muted text-sm">Crea tu cuenta</p> </div> <!-- Error Message --> <div id="error-message" class="hidden bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg" role="alert"> <span class="block sm:inline" id="error-text"></span> </div> <!-- Success Message --> <div id="success-message" class="hidden bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg" role="alert"> <span class="block sm:inline">¡Cuenta creada exitosamente! Redirigiendo...</span> </div> <form id="register-form" class="mt-8 space-y-4"> <div> <label for="email" class="block text-sm font-medium text-pm-muted mb-1">Email</label> <input id="email" name="email" type="email" autocomplete="email" required class="appearance-none block w-full px-4 py-3 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors" placeholder="correo@ejemplo.com"> </div> <div> <label for="password" class="block text-sm font-medium text-pm-muted mb-1">Contraseña</label> <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" class="appearance-none block w-full px-4 py-3 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors" placeholder="Mínimo 8 caracteres"> </div> <div> <label for="confirm-password" class="block text-sm font-medium text-pm-muted mb-1">Confirmar Contraseña</label> <input id="confirm-password" name="confirm-password" type="password" autocomplete="new-password" required class="appearance-none block w-full px-4 py-3 border border-pm-border rounded-lg bg-pm-elevated text-pm-text placeholder-pm-dim focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors" placeholder="Repite la contraseña"> </div> <div> <label for="role" class="block text-sm font-medium text-pm-muted mb-1">Tipo de Cuenta</label> <select id="role" name="role" required class="block w-full px-4 py-3 border border-pm-border bg-pm-elevated text-pm-text rounded-lg focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors"> <option value="" class="bg-pm-elevated">Selecciona un tipo</option> <option value="client" class="bg-pm-elevated">Cliente — Agendar citas</option> <option value="provider" class="bg-pm-elevated">Proveedor — Ofrecer servicios</option> </select> </div> <div class="pt-2"> <button type="submit" id="register-button" class="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"> <span id="register-text">Crear Cuenta</span> </button> </div> <div class="text-center"> <a href="/login" class="text-sm text-pm-muted hover:text-pm-gold transition-colors underline underline-offset-2">
¿Ya tienes cuenta? Iniciar sesión
</a> </div> </form> </div> </main> ` })} ${renderScript($$result, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/register.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/register.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
