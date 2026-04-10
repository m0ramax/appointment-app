/* empty css                                         */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CVD3g8sF.mjs';
export { renderers } from '../renderers.mjs';

const $$AccessDenied = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Acceso Denegado", "description": "No tienes permisos para acceder a esta p\xE1gina" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> <div class="max-w-md w-full space-y-8 text-center"> <div> <div class="mx-auto h-16 w-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center"> <svg class="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"></path> </svg> </div> <h2 class="mt-6 text-3xl font-extrabold text-pm-text">
Acceso Denegado
</h2> <p class="mt-2 text-sm text-pm-muted">No tienes permisos para acceder a esta página.</p> <p class="mt-1 text-sm text-pm-dim">Verifica que estés usando la cuenta correcta.</p> </div> <div class="space-y-3"> <a href="/dashboard" class="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors">
Ir a Dashboard Cliente
</a> <a href="/provider/dashboard" class="w-full flex justify-center py-3 px-4 border border-pm-border rounded-lg text-sm font-medium text-pm-muted hover:border-pm-gold hover:text-pm-text transition-colors">
Ir a Dashboard Proveedor
</a> <a href="/login" class="block text-sm text-pm-muted hover:text-pm-gold transition-colors">
Cambiar de cuenta
</a> </div> </div> </main> ` })}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/access-denied.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/access-denied.astro";
const $$url = "/access-denied";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AccessDenied,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
