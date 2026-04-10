import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_DYLAv9-u.mjs';
import { manifest } from './manifest_CAIc9CAr.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/access-denied.astro.mjs');
const _page2 = () => import('./pages/appointments/book.astro.mjs');
const _page3 = () => import('./pages/appointments/new.astro.mjs');
const _page4 = () => import('./pages/auth/login.astro.mjs');
const _page5 = () => import('./pages/dashboard.astro.mjs');
const _page6 = () => import('./pages/login.astro.mjs');
const _page7 = () => import('./pages/provider/dashboard.astro.mjs');
const _page8 = () => import('./pages/provider/schedule.astro.mjs');
const _page9 = () => import('./pages/register.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/access-denied.astro", _page1],
    ["src/pages/appointments/book.astro", _page2],
    ["src/pages/appointments/new.astro", _page3],
    ["src/pages/auth/login.astro", _page4],
    ["src/pages/dashboard/index.astro", _page5],
    ["src/pages/login.astro", _page6],
    ["src/pages/provider/dashboard/index.astro", _page7],
    ["src/pages/provider/schedule.astro", _page8],
    ["src/pages/register.astro", _page9],
    ["src/pages/index.astro", _page10]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "b207ef9f-0f8b-46e7-853c-e61f72851810",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
