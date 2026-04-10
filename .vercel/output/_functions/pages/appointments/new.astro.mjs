/* empty css                                            */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_CVD3g8sF.mjs';
export { renderers } from '../../renderers.mjs';

const $$New = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Agendar Cita", "description": "Agenda una nueva cita en nuestro sistema de agendamiento." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen py-12"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="text-center mb-10"> <h1 class="text-3xl font-extrabold text-pm-text sm:text-4xl">
Agenda tu <span class="text-pm-gold">Cita</span> </h1> <p class="mt-3 max-w-2xl mx-auto text-pm-muted sm:mt-4">
Selecciona proveedor, fecha, hora y completa los detalles de tu cita
</p> </div> ${renderComponent($$result2, "AppointmentForm", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/components/forms/AppointmentForm", "client:component-export": "default" })} </div> </main> ` })}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/appointments/new.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/appointments/new.astro";
const $$url = "/appointments/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
