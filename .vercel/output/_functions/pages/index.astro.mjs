/* empty css                                         */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CVD3g8sF.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Inicio", "description": "Sistema de agendamiento de citas online. Agenda tu cita de manera f\xE1cil y r\xE1pida." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="relative"> <!-- Hero section --> <div class="relative pt-20 pb-32 overflow-hidden"> <div class="relative"> <div class="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24"> <div class="px-4 max-w-xl mx-auto sm:px-6 lg:py-20 lg:max-w-none lg:mx-0 lg:px-0"> <div> <div class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pm-gold-dim text-pm-gold border border-pm-gold/20 mb-6">
Sistema de Agendamiento Premium
</div> <h1 class="text-4xl font-extrabold tracking-tight text-pm-text sm:text-5xl lg:text-6xl">
Agenda tu cita de forma
<span class="text-pm-gold"> fácil y rápida</span> </h1> <p class="mt-6 text-lg text-pm-muted leading-relaxed">
Nuestro sistema te permite agendar citas de manera sencilla,
                eligiendo el horario que mejor se adapte a tu agenda.
</p> </div> <div class="mt-10 flex flex-col sm:flex-row gap-4"> <a href="/appointments/new" class="inline-flex items-center justify-center px-6 py-3 text-base font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light focus:outline-none transition-all shadow-premium-gold">
Agendar Cita
</a> <a href="/auth/login" class="inline-flex items-center justify-center px-6 py-3 border border-pm-border text-base font-medium rounded-lg text-pm-text hover:border-pm-gold hover:text-pm-gold focus:outline-none transition-all">
Iniciar Sesión
</a> </div> </div> <div class="mt-12 sm:mt-16 lg:mt-0"> <div class="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full flex items-center justify-center"> <!-- Premium calendar preview card --> <div class="bg-pm-surface border border-pm-border rounded-2xl p-6 shadow-premium max-w-sm w-full"> <div class="flex items-center justify-between mb-4"> <span class="text-pm-text font-semibold">Abril 2026</span> <div class="flex space-x-2"> <div class="w-2 h-2 rounded-full bg-pm-gold"></div> <div class="w-2 h-2 rounded-full bg-pm-border"></div> <div class="w-2 h-2 rounded-full bg-pm-border"></div> </div> </div> <div class="grid grid-cols-7 gap-1 text-center text-xs text-pm-dim mb-2"> ${["L", "M", "M", "J", "V", "S", "D"].map((d) => renderTemplate`<span>${d}</span>`)} </div> <div class="grid grid-cols-7 gap-1 text-center text-sm"> ${[...Array(30)].map((_, i) => renderTemplate`<span${addAttribute(`py-1.5 rounded-md cursor-pointer transition-colors ${i === 7 ? "bg-pm-gold text-pm-bg font-bold" : [2, 9, 14, 21].includes(i) ? "border border-pm-gold text-pm-gold" : "text-pm-muted hover:bg-pm-elevated"}`, "class")}>${i + 1}</span>`)} </div> <div class="mt-4 pt-4 border-t border-pm-border"> <p class="text-xs text-pm-dim mb-2">Horarios disponibles</p> <div class="flex flex-wrap gap-2"> ${["09:00", "10:00", "11:00", "14:00", "15:00"].map((t) => renderTemplate`<span class="px-3 py-1 border border-pm-gold text-pm-gold text-xs rounded-md">${t}</span>`)} </div> </div> </div> </div> </div> </div> </div> </div> <!-- Feature section --> <div class="bg-pm-surface border-t border-pm-border py-16"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="lg:text-center"> <h2 class="text-xs text-pm-gold font-semibold tracking-widest uppercase">
Características
</h2> <p class="mt-3 text-3xl leading-8 font-extrabold tracking-tight text-pm-text sm:text-4xl">
Una mejor manera de gestionar tu tiempo
</p> </div> <div class="mt-12"> <dl class="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10"> <div class="relative"> <dt> <div class="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-pm-gold-dim border border-pm-gold/20 text-pm-gold"> <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path> </svg> </div> <p class="ml-16 text-lg leading-6 font-semibold text-pm-text">Ahorra tiempo</p> </dt> <dd class="mt-2 ml-16 text-base text-pm-muted">
Agenda tus citas en cualquier momento, sin necesidad de llamadas telefónicas.
</dd> </div> <div class="relative"> <dt> <div class="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-pm-gold-dim border border-pm-gold/20 text-pm-gold"> <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> </div> <p class="ml-16 text-lg leading-6 font-semibold text-pm-text">Flexibilidad</p> </dt> <dd class="mt-2 ml-16 text-base text-pm-muted">
Elige el horario que mejor se adapte a tu agenda.
</dd> </div> <div class="relative"> <dt> <div class="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-pm-gold-dim border border-pm-gold/20 text-pm-gold"> <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path> </svg> </div> <p class="ml-16 text-lg leading-6 font-semibold text-pm-text">Confiabilidad</p> </dt> <dd class="mt-2 ml-16 text-base text-pm-muted">
Confirmaciones inmediatas y recordatorios automáticos.
</dd> </div> <div class="relative"> <dt> <div class="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-pm-gold-dim border border-pm-gold/20 text-pm-gold"> <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg> </div> <p class="ml-16 text-lg leading-6 font-semibold text-pm-text">Multi-proveedor</p> </dt> <dd class="mt-2 ml-16 text-base text-pm-muted">
Gestiona múltiples proveedores y sus horarios de trabajo.
</dd> </div> </dl> </div> </div> </div> </main> ` })}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/index.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
