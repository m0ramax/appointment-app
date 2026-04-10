/* empty css                                            */
import { c as createComponent, r as renderComponent, b as renderScript, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Bk79-dTD.mjs';
import 'kleur/colors';
import { b as apiClient, a as authService, $ as $$Layout } from '../../chunks/Layout_CVD3g8sF.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
export { renderers } from '../../renderers.mjs';

const workScheduleService = {
  // ========== WORK SCHEDULES ==========
  async createWorkSchedule(schedule) {
    const response = await apiClient.post("/api/v1/work-schedules/schedules", schedule);
    return response.data;
  },
  async getProviderWorkSchedules(providerId) {
    const response = await apiClient.get(`/api/v1/work-schedules/schedules/${providerId}`);
    return response.data;
  },
  async updateWorkSchedule(scheduleId, schedule) {
    const response = await apiClient.put(`/api/v1/work-schedules/schedules/${scheduleId}`, schedule);
    return response.data;
  },
  async deleteWorkSchedule(scheduleId) {
    await apiClient.delete(`/api/v1/work-schedules/schedules/${scheduleId}`);
  },
  // ========== SCHEDULE EXCEPTIONS ==========
  async createScheduleException(exception) {
    const response = await apiClient.post("/api/v1/work-schedules/exceptions", exception);
    return response.data;
  },
  async getScheduleExceptions(providerId, startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const response = await apiClient.get(
      `/api/v1/work-schedules/exceptions/${providerId}?${params.toString()}`
    );
    return response.data;
  },
  async updateScheduleException(exceptionId, exception) {
    const response = await apiClient.put(`/api/v1/work-schedules/exceptions/${exceptionId}`, exception);
    return response.data;
  },
  async deleteScheduleException(exceptionId) {
    await apiClient.delete(`/api/v1/work-schedules/exceptions/${exceptionId}`);
  },
  // ========== PROVIDER SETTINGS ==========
  async createOrUpdateProviderSettings(settings) {
    const response = await apiClient.post("/api/v1/work-schedules/settings", settings);
    return response.data;
  },
  async getProviderSettings(providerId) {
    const response = await apiClient.get(`/api/v1/work-schedules/settings/${providerId}`);
    return response.data;
  },
  // ========== AVAILABILITY ==========
  async getProviderAvailability(providerId, date) {
    const response = await apiClient.get(`/api/v1/work-schedules/availability/${providerId}/${date}`);
    return response.data;
  },
  async getWeeklySchedule(providerId) {
    const response = await apiClient.get(`/api/v1/work-schedules/weekly-schedule/${providerId}`);
    return response.data;
  },
  // ========== UTILITY FUNCTIONS ==========
  getDayName(dayOfWeek) {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[dayOfWeek] || "Desconocido";
  },
  formatTime(timeString) {
    return timeString.substring(0, 5);
  },
  getExceptionTypeLabel(type) {
    const labels = {
      day_off: "Día libre",
      vacation: "Vacaciones",
      custom_hours: "Horario personalizado",
      holiday: "Día festivo"
    };
    return labels[type] || type;
  }
};

function WorkScheduleManager({ providerId, onScheduleUpdate }) {
  const [currentProviderId, setCurrentProviderId] = useState(providerId || null);
  const [schedules, setSchedules] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingDay, setEditingDay] = useState(null);
  const daysOfWeek = [
    { id: 1, name: "Lunes" },
    { id: 2, name: "Martes" },
    { id: 3, name: "Miércoles" },
    { id: 4, name: "Jueves" },
    { id: 5, name: "Viernes" },
    { id: 6, name: "Sábado" },
    { id: 0, name: "Domingo" }
  ];
  useEffect(() => {
    if (!currentProviderId) {
      authService.getProfile().then((user) => {
        if (user && user.role === "provider") setCurrentProviderId(user.id);
      }).catch(() => {
        setError("Error al obtener información del usuario");
        setLoading(false);
      });
    } else {
      loadScheduleData();
    }
  }, [currentProviderId]);
  useEffect(() => {
    if (currentProviderId) loadScheduleData();
  }, [currentProviderId]);
  const loadScheduleData = async () => {
    if (!currentProviderId) return;
    setLoading(true);
    setError("");
    try {
      const [schedulesData, settingsData] = await Promise.all([
        workScheduleService.getProviderWorkSchedules(currentProviderId),
        workScheduleService.getProviderSettings(currentProviderId).catch(() => null)
      ]);
      setSchedules(schedulesData);
      setSettings(settingsData);
    } catch {
      setError("Error al cargar los horarios");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateSchedule = async (dayOfWeek) => {
    if (!currentProviderId) return;
    try {
      const newSchedule = {
        provider_id: currentProviderId,
        day_of_week: dayOfWeek,
        start_time: "09:00",
        end_time: "17:00",
        slot_duration_minutes: settings?.default_slot_duration || 30,
        is_active: true
      };
      await workScheduleService.createWorkSchedule(newSchedule);
      await loadScheduleData();
      onScheduleUpdate?.();
      setEditingDay(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al crear horario");
    }
  };
  const handleUpdateSchedule = async (schedule, updates) => {
    try {
      await workScheduleService.updateWorkSchedule(schedule.id, updates);
      await loadScheduleData();
      onScheduleUpdate?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al actualizar horario");
    }
  };
  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este horario?")) return;
    try {
      await workScheduleService.deleteWorkSchedule(scheduleId);
      await loadScheduleData();
      onScheduleUpdate?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al eliminar horario");
    }
  };
  const getScheduleForDay = (dayOfWeek) => schedules.find((s) => s.day_of_week === dayOfWeek && s.is_active) || null;
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-10", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-10 w-10 border-2 border-pm-border border-t-pm-gold mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-pm-muted text-sm", children: "Cargando horarios..." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-5 mt-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-pm-text", children: "Horarios de Trabajo" }),
      /* @__PURE__ */ jsx("button", { onClick: loadScheduleData, className: "text-sm text-pm-muted hover:text-pm-gold transition-colors", children: "Actualizar" })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-400/10 border border-red-400/20 text-red-400 px-4 py-3 rounded-lg text-sm", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "bg-pm-surface border border-pm-border rounded-xl overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "px-5 py-4 border-b border-pm-border", children: /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-pm-text", children: "Configuración Semanal" }) }),
      /* @__PURE__ */ jsx("div", { className: "divide-y divide-pm-border", children: daysOfWeek.map((day) => {
        const schedule = getScheduleForDay(day.id);
        const isEditing = editingDay === day.id;
        return /* @__PURE__ */ jsxs("div", { className: "px-5 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-pm-text w-20 flex-shrink-0", children: day.name }),
              schedule ? /* @__PURE__ */ jsxs("div", { className: "flex items-center flex-wrap gap-3", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-pm-muted", children: [
                  workScheduleService.formatTime(schedule.start_time),
                  " — ",
                  workScheduleService.formatTime(schedule.end_time)
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-pm-dim bg-pm-elevated px-2 py-0.5 rounded", children: [
                  schedule.slot_duration_minutes,
                  "min slots"
                ] }),
                schedule.break_start && schedule.break_end && /* @__PURE__ */ jsxs("span", { className: "text-xs text-pm-dim", children: [
                  "Descanso: ",
                  workScheduleService.formatTime(schedule.break_start),
                  " — ",
                  workScheduleService.formatTime(schedule.break_end)
                ] })
              ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-pm-dim", children: "No configurado" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3 flex-shrink-0 ml-4", children: schedule ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setEditingDay(isEditing ? null : day.id),
                  className: "text-sm text-pm-gold hover:text-pm-gold-light transition-colors",
                  children: isEditing ? "Cancelar" : "Editar"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDeleteSchedule(schedule.id),
                  className: "text-sm text-red-400 hover:text-red-300 transition-colors",
                  children: "Eliminar"
                }
              )
            ] }) : /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleCreateSchedule(day.id),
                className: "text-sm text-pm-gold hover:text-pm-gold-light transition-colors",
                children: "Configurar"
              }
            ) })
          ] }),
          isEditing && schedule && /* @__PURE__ */ jsx(
            ScheduleEditForm,
            {
              schedule,
              onUpdate: (updates) => handleUpdateSchedule(schedule, updates),
              onCancel: () => setEditingDay(null)
            }
          )
        ] }, day.id);
      }) })
    ] })
  ] });
}
function ScheduleEditForm({ schedule, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    start_time: workScheduleService.formatTime(schedule.start_time),
    end_time: workScheduleService.formatTime(schedule.end_time),
    slot_duration_minutes: schedule.slot_duration_minutes,
    break_start: schedule.break_start ? workScheduleService.formatTime(schedule.break_start) : "",
    break_end: schedule.break_end ? workScheduleService.formatTime(schedule.break_end) : ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      start_time: formData.start_time,
      end_time: formData.end_time,
      slot_duration_minutes: formData.slot_duration_minutes,
      break_start: formData.break_start || null,
      break_end: formData.break_end || null
    });
  };
  const inputClass = "mt-1 block w-full px-3 py-2 border border-pm-border rounded-lg bg-pm-bg text-pm-text text-sm focus:outline-none focus:border-pm-gold focus:ring-1 focus:ring-pm-gold transition-colors";
  const labelClass = "block text-xs font-medium text-pm-muted";
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "mt-4 p-4 bg-pm-elevated border border-pm-border rounded-xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Hora de inicio" }),
        /* @__PURE__ */ jsx("input", { type: "time", value: formData.start_time, onChange: (e) => setFormData({ ...formData, start_time: e.target.value }), className: inputClass, required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Hora de fin" }),
        /* @__PURE__ */ jsx("input", { type: "time", value: formData.end_time, onChange: (e) => setFormData({ ...formData, end_time: e.target.value }), className: inputClass, required: true })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Duración de slots" }),
        /* @__PURE__ */ jsxs("select", { value: formData.slot_duration_minutes, onChange: (e) => setFormData({ ...formData, slot_duration_minutes: parseInt(e.target.value) }), className: inputClass, children: [
          /* @__PURE__ */ jsx("option", { value: 15, className: "bg-pm-elevated", children: "15 min" }),
          /* @__PURE__ */ jsx("option", { value: 30, className: "bg-pm-elevated", children: "30 min" }),
          /* @__PURE__ */ jsx("option", { value: 45, className: "bg-pm-elevated", children: "45 min" }),
          /* @__PURE__ */ jsx("option", { value: 60, className: "bg-pm-elevated", children: "60 min" }),
          /* @__PURE__ */ jsx("option", { value: 90, className: "bg-pm-elevated", children: "90 min" }),
          /* @__PURE__ */ jsx("option", { value: 120, className: "bg-pm-elevated", children: "120 min" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Descanso inicio (opcional)" }),
        /* @__PURE__ */ jsx("input", { type: "time", value: formData.break_start, onChange: (e) => setFormData({ ...formData, break_start: e.target.value }), className: inputClass })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: labelClass, children: "Descanso fin (opcional)" }),
        /* @__PURE__ */ jsx("input", { type: "time", value: formData.break_end, onChange: (e) => setFormData({ ...formData, break_end: e.target.value }), className: inputClass })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex justify-end space-x-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "px-4 py-2 text-sm font-medium text-pm-muted border border-pm-border rounded-lg hover:border-pm-gold hover:text-pm-text transition-colors",
          children: "Cancelar"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "px-4 py-2 text-sm font-semibold text-pm-bg bg-pm-gold hover:bg-pm-gold-light rounded-lg transition-colors",
          children: "Guardar"
        }
      )
    ] })
  ] });
}

function SimpleScheduleTest() {
  const [user, setUser] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Loading user data...");
      const userData = await authService.getProfile();
      console.log("User data:", userData);
      setUser(userData);
      if (userData?.id) {
        console.log("Loading schedules for provider:", userData.id);
        const schedulesData = await workScheduleService.getProviderWorkSchedules(userData.id);
        console.log("Schedules data:", schedulesData);
        setSchedules(schedulesData);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || err.response?.data?.detail || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };
  const createTestSchedule = async () => {
    if (!user?.id) return;
    try {
      console.log("Creating test schedule...");
      const newSchedule = {
        provider_id: user.id,
        day_of_week: 1,
        // Monday
        start_time: "09:00",
        end_time: "17:00",
        slot_duration_minutes: 30,
        is_active: true
      };
      console.log("Schedule data:", newSchedule);
      const result = await workScheduleService.createWorkSchedule(newSchedule);
      console.log("Created schedule:", result);
      await loadData();
    } catch (err) {
      console.error("Error creating schedule:", err);
      setError(err.response?.data?.detail || "Error al crear horario");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-4 border rounded", children: /* @__PURE__ */ jsx("p", { children: "Cargando datos de prueba..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 border rounded space-y-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "font-bold", children: "Debug: Prueba de Horarios" }),
    error && /* @__PURE__ */ jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded", children: [
      /* @__PURE__ */ jsx("strong", { children: "Error:" }),
      " ",
      error
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-3 rounded", children: [
      /* @__PURE__ */ jsx("h4", { className: "font-medium", children: "Usuario actual:" }),
      /* @__PURE__ */ jsx("pre", { className: "text-xs mt-2", children: JSON.stringify(user, null, 2) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-3 rounded", children: [
      /* @__PURE__ */ jsxs("h4", { className: "font-medium", children: [
        "Horarios (",
        schedules.length,
        "):"
      ] }),
      /* @__PURE__ */ jsx("pre", { className: "text-xs mt-2", children: JSON.stringify(schedules, null, 2) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: loadData,
          className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
          children: "Recargar Datos"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: createTestSchedule,
          className: "px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600",
          disabled: !user?.id || user.role !== "provider",
          children: "Crear Horario de Prueba"
        }
      )
    ] })
  ] });
}

const $$Schedule = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Configuraci\xF3n de Horarios", "description": "Configura tus horarios de trabajo y disponibilidad" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="py-10"> <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> <!-- Breadcrumb + Header --> <div class="mb-8"> <nav class="flex items-center space-x-2 text-sm text-pm-dim mb-4"> <a href="/provider/dashboard" class="hover:text-pm-gold transition-colors">Dashboard</a> <span>/</span> <span class="text-pm-muted">Configuración de Horarios</span> </nav> <h1 class="text-3xl font-bold text-pm-text">
Configuración de <span class="text-pm-gold">Horarios</span> </h1> <p class="mt-2 text-pm-muted">
Configura tus horarios de trabajo, días de descanso y disponibilidad para citas.
</p> </div> ${renderComponent($$result2, "SimpleScheduleTest", SimpleScheduleTest, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/components/work-schedule/SimpleScheduleTest", "client:component-export": "default" })} ${renderComponent($$result2, "WorkScheduleManager", WorkScheduleManager, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/components/work-schedule/WorkScheduleManager", "client:component-export": "default" })} </div> </main> ` })} ${renderScript($$result, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/provider/schedule.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/provider/schedule.astro", void 0);

const $$file = "/Users/m0ramax/Desktop/Dev/appointment/appointment-app/src/pages/provider/schedule.astro";
const $$url = "/provider/schedule";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Schedule,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
