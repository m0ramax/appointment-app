/* empty css                                         */
import { c as createComponent, r as renderComponent, b as renderScript, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CVD3g8sF.mjs';
import { A as AppointmentList } from '../chunks/AppointmentList_DyDIAX8L.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dashboard", "description": "Panel de control del usuario" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="py-10"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Header --> <div class="md:flex md:items-center md:justify-between"> <div class="flex-1 min-w-0"> <h1 class="text-2xl font-bold text-pm-text sm:text-3xl">
Dashboard
</h1> <div class="mt-1 flex items-center text-sm text-pm-muted"> <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-pm-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> <span id="user-info">Cliente</span> </div> </div> <div class="mt-4 flex md:mt-0 md:ml-4"> <a href="/appointments/new" class="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light focus:outline-none transition-all">
+ Nueva Cita
</a> </div> </div> <!-- Welcome Banner --> <div class="mt-8 bg-pm-surface border border-pm-border rounded-xl p-6 flex items-center space-x-4"> <div class="h-12 w-12 rounded-full bg-pm-gold-dim border border-pm-gold/20 flex items-center justify-center flex-shrink-0"> <svg class="h-6 w-6 text-pm-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path> </svg> </div> <div> <h2 class="text-base font-semibold text-pm-text">
¡Hola, <span id="welcome-user-name">Usuario</span>!
</h2> <p class="text-sm text-pm-muted">Bienvenido de vuelta. Aquí puedes gestionar todas tus citas.</p> </div> </div> <!-- Stats Cards --> <div class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4"> <div class="bg-pm-surface border border-pm-border rounded-xl p-5"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-pm-dim uppercase tracking-wider">Total Citas</p> <p class="text-2xl font-bold text-pm-text mt-1" id="total-appointments">—</p> </div> <div class="h-10 w-10 rounded-lg bg-pm-elevated flex items-center justify-center"> <svg class="h-5 w-5 text-pm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> </div> </div> <div class="bg-pm-surface border border-pm-border rounded-xl p-5"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-pm-dim uppercase tracking-wider">Pendientes</p> <p class="text-2xl font-bold text-yellow-400 mt-1" id="pending-appointments">—</p> </div> <div class="h-10 w-10 rounded-lg bg-yellow-400/10 flex items-center justify-center"> <svg class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> </div> </div> <div class="bg-pm-surface border border-pm-border rounded-xl p-5"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-pm-dim uppercase tracking-wider">Confirmadas</p> <p class="text-2xl font-bold text-green-400 mt-1" id="confirmed-appointments">—</p> </div> <div class="h-10 w-10 rounded-lg bg-green-400/10 flex items-center justify-center"> <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> </div> </div> <div class="bg-pm-surface border border-pm-border rounded-xl p-5"> <div class="flex items-center justify-between"> <div> <p class="text-xs font-medium text-pm-dim uppercase tracking-wider">Completadas</p> <p class="text-2xl font-bold text-blue-400 mt-1" id="completed-appointments">—</p> </div> <div class="h-10 w-10 rounded-lg bg-blue-400/10 flex items-center justify-center"> <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path> </svg> </div> </div> </div> </div> <!-- Appointments List --> <div class="mt-8"> ${renderComponent($$result2, "AppointmentList", AppointmentList, { "client:load": true, "userRole": "client", "client:component-hydration": "load", "client:component-path": "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/components/appointments/AppointmentList", "client:component-export": "default" })} </div> </div> </main> ` })} ${renderScript($$result, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/dashboard/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/dashboard/index.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
