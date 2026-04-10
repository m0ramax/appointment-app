import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { b as buildFormatLongFn, a as buildLocalizeFn, c as buildMatchFn, d as buildMatchPatternFn, e as appointmentService, f as format } from './appointments_DXR3Mhtb.mjs';

const formatDistanceLocale = {
  lessThanXSeconds: {
    one: "menos de un segundo",
    other: "menos de {{count}} segundos",
  },

  xSeconds: {
    one: "1 segundo",
    other: "{{count}} segundos",
  },

  halfAMinute: "medio minuto",

  lessThanXMinutes: {
    one: "menos de un minuto",
    other: "menos de {{count}} minutos",
  },

  xMinutes: {
    one: "1 minuto",
    other: "{{count}} minutos",
  },

  aboutXHours: {
    one: "alrededor de 1 hora",
    other: "alrededor de {{count}} horas",
  },

  xHours: {
    one: "1 hora",
    other: "{{count}} horas",
  },

  xDays: {
    one: "1 día",
    other: "{{count}} días",
  },

  aboutXWeeks: {
    one: "alrededor de 1 semana",
    other: "alrededor de {{count}} semanas",
  },

  xWeeks: {
    one: "1 semana",
    other: "{{count}} semanas",
  },

  aboutXMonths: {
    one: "alrededor de 1 mes",
    other: "alrededor de {{count}} meses",
  },

  xMonths: {
    one: "1 mes",
    other: "{{count}} meses",
  },

  aboutXYears: {
    one: "alrededor de 1 año",
    other: "alrededor de {{count}} años",
  },

  xYears: {
    one: "1 año",
    other: "{{count}} años",
  },

  overXYears: {
    one: "más de 1 año",
    other: "más de {{count}} años",
  },

  almostXYears: {
    one: "casi 1 año",
    other: "casi {{count}} años",
  },
};

const formatDistance = (token, count, options) => {
  let result;

  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }

  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "en " + result;
    } else {
      return "hace " + result;
    }
  }

  return result;
};

const dateFormats = {
  full: "EEEE, d 'de' MMMM 'de' y",
  long: "d 'de' MMMM 'de' y",
  medium: "d MMM y",
  short: "dd/MM/y",
};

const timeFormats = {
  full: "HH:mm:ss zzzz",
  long: "HH:mm:ss z",
  medium: "HH:mm:ss",
  short: "HH:mm",
};

const dateTimeFormats = {
  full: "{{date}} 'a las' {{time}}",
  long: "{{date}} 'a las' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}",
};

const formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full",
  }),

  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full",
  }),

  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full",
  }),
};

const formatRelativeLocale = {
  lastWeek: "'el' eeee 'pasado a la' p",
  yesterday: "'ayer a la' p",
  today: "'hoy a la' p",
  tomorrow: "'mañana a la' p",
  nextWeek: "eeee 'a la' p",
  other: "P",
};

const formatRelativeLocalePlural = {
  lastWeek: "'el' eeee 'pasado a las' p",
  yesterday: "'ayer a las' p",
  today: "'hoy a las' p",
  tomorrow: "'mañana a las' p",
  nextWeek: "eeee 'a las' p",
  other: "P",
};

const formatRelative = (token, date, _baseDate, _options) => {
  if (date.getHours() !== 1) {
    return formatRelativeLocalePlural[token];
  } else {
    return formatRelativeLocale[token];
  }
};

const eraValues = {
  narrow: ["AC", "DC"],
  abbreviated: ["AC", "DC"],
  wide: ["antes de cristo", "después de cristo"],
};

const quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["T1", "T2", "T3", "T4"],
  wide: ["1º trimestre", "2º trimestre", "3º trimestre", "4º trimestre"],
};

const monthValues = {
  narrow: ["e", "f", "m", "a", "m", "j", "j", "a", "s", "o", "n", "d"],
  abbreviated: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],

  wide: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
};

const dayValues = {
  narrow: ["d", "l", "m", "m", "j", "v", "s"],
  short: ["do", "lu", "ma", "mi", "ju", "vi", "sá"],
  abbreviated: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  wide: [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ],
};

const dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mn",
    noon: "md",
    morning: "mañana",
    afternoon: "tarde",
    evening: "tarde",
    night: "noche",
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "mañana",
    afternoon: "tarde",
    evening: "tarde",
    night: "noche",
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "mañana",
    afternoon: "tarde",
    evening: "tarde",
    night: "noche",
  },
};

const formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mn",
    noon: "md",
    morning: "de la mañana",
    afternoon: "de la tarde",
    evening: "de la tarde",
    night: "de la noche",
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "de la mañana",
    afternoon: "de la tarde",
    evening: "de la tarde",
    night: "de la noche",
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "medianoche",
    noon: "mediodia",
    morning: "de la mañana",
    afternoon: "de la tarde",
    evening: "de la tarde",
    night: "de la noche",
  },
};

const ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  return number + "º";
};

const localize = {
  ordinalNumber: ordinalNumber,

  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide",
  }),

  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => Number(quarter) - 1,
  }),

  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide",
  }),

  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide",
  }),

  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide",
  }),
};

const matchOrdinalNumberPattern = /^(\d+)(º)?/i;
const parseOrdinalNumberPattern = /\d+/i;

const matchEraPatterns = {
  narrow: /^(ac|dc|a|d)/i,
  abbreviated: /^(a\.?\s?c\.?|a\.?\s?e\.?\s?c\.?|d\.?\s?c\.?|e\.?\s?c\.?)/i,
  wide: /^(antes de cristo|antes de la era com[uú]n|despu[eé]s de cristo|era com[uú]n)/i,
};
const parseEraPatterns = {
  any: [/^ac/i, /^dc/i],
  wide: [
    /^(antes de cristo|antes de la era com[uú]n)/i,
    /^(despu[eé]s de cristo|era com[uú]n)/i,
  ],
};

const matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^T[1234]/i,
  wide: /^[1234](º)? trimestre/i,
};
const parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i],
};

const matchMonthPatterns = {
  narrow: /^[efmajsond]/i,
  abbreviated: /^(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i,
  wide: /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
};
const parseMonthPatterns = {
  narrow: [
    /^e/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i,
  ],

  any: [
    /^en/i,
    /^feb/i,
    /^mar/i,
    /^abr/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^ago/i,
    /^sep/i,
    /^oct/i,
    /^nov/i,
    /^dic/i,
  ],
};

const matchDayPatterns = {
  narrow: /^[dlmjvs]/i,
  short: /^(do|lu|ma|mi|ju|vi|s[áa])/i,
  abbreviated: /^(dom|lun|mar|mi[ée]|jue|vie|s[áa]b)/i,
  wide: /^(domingo|lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado)/i,
};
const parseDayPatterns = {
  narrow: [/^d/i, /^l/i, /^m/i, /^m/i, /^j/i, /^v/i, /^s/i],
  any: [/^do/i, /^lu/i, /^ma/i, /^mi/i, /^ju/i, /^vi/i, /^sa/i],
};

const matchDayPeriodPatterns = {
  narrow: /^(a|p|mn|md|(de la|a las) (mañana|tarde|noche))/i,
  any: /^([ap]\.?\s?m\.?|medianoche|mediodia|(de la|a las) (mañana|tarde|noche))/i,
};
const parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mn/i,
    noon: /^md/i,
    morning: /mañana/i,
    afternoon: /tarde/i,
    evening: /tarde/i,
    night: /noche/i,
  },
};

const match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function (value) {
      return parseInt(value, 10);
    },
  }),

  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any",
  }),

  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1,
  }),

  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any",
  }),

  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any",
  }),

  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any",
  }),
};

/**
 * @category Locales
 * @summary Spanish locale.
 * @language Spanish
 * @iso-639-2 spa
 * @author Juan Angosto [@juanangosto](https://github.com/juanangosto)
 * @author Guillermo Grau [@guigrpa](https://github.com/guigrpa)
 * @author Fernando Agüero [@fjaguero](https://github.com/fjaguero)
 * @author Gastón Haro [@harogaston](https://github.com/harogaston)
 * @author Yago Carballo [@YagoCarballo](https://github.com/YagoCarballo)
 */
const es = {
  code: "es",
  formatDistance: formatDistance,
  formatLong: formatLong,
  formatRelative: formatRelative,
  localize: localize,
  match: match,
  options: {
    weekStartsOn: 1 /* Monday */,
    firstWeekContainsDate: 1,
  },
};

function AppointmentList({ userRole = "client" }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    loadAppointments();
  }, []);
  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const userAppointments = await appointmentService.getUserAppointments();
      setAppointments(userAppointments);
    } catch (err) {
      setError("Error al cargar las citas");
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      switch (newStatus) {
        case "confirmed":
          await appointmentService.confirmAppointment(appointmentId);
          break;
        case "completed":
          await appointmentService.completeAppointment(appointmentId);
          break;
        case "cancelled":
          await appointmentService.cancelAppointmentByStatus(appointmentId);
          break;
        default:
          await appointmentService.updateAppointment(appointmentId, { status: newStatus });
      }
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al actualizar la cita");
    }
  };
  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) return;
    try {
      await appointmentService.cancelAppointmentByStatus(appointmentId);
      await loadAppointments();
    } catch (err) {
      setError(err.response?.data?.detail || "Error al cancelar la cita");
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20";
      case "confirmed":
        return "bg-green-400/10 text-green-400 border border-green-400/20";
      case "cancelled":
        return "bg-red-400/10 text-red-400 border border-red-400/20";
      case "completed":
        return "bg-blue-400/10 text-blue-400 border border-blue-400/20";
      default:
        return "bg-pm-elevated text-pm-muted border border-pm-border";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Completada";
      default:
        return status;
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-10 w-10 border-2 border-pm-border border-t-pm-gold mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-pm-muted text-sm", children: "Cargando citas..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-lg", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: loadAppointments,
          className: "mt-4 px-4 py-2 bg-pm-gold text-pm-bg text-sm font-semibold rounded-lg hover:bg-pm-gold-light transition-colors",
          children: "Reintentar"
        }
      )
    ] });
  }
  if (appointments.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-16 bg-pm-surface border border-pm-border rounded-xl", children: [
      /* @__PURE__ */ jsx("svg", { className: "mx-auto h-12 w-12 text-pm-dim", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
      /* @__PURE__ */ jsx("h3", { className: "mt-3 text-base font-medium text-pm-text", children: "No hay citas" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-pm-muted", children: userRole === "client" ? "Aún no has agendado ninguna cita." : "No tienes citas asignadas." }),
      userRole === "client" && /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
        "a",
        {
          href: "/appointments/new",
          className: "inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-pm-bg bg-pm-gold hover:bg-pm-gold-light transition-colors",
          children: "Agendar Primera Cita"
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-pm-text", children: userRole === "client" ? "Mis Citas" : "Citas Asignadas" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: loadAppointments,
          className: "text-sm text-pm-muted hover:text-pm-gold transition-colors",
          children: "Actualizar"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-pm-surface border border-pm-border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("ul", { className: "divide-y divide-pm-border", children: appointments.map((appointment) => /* @__PURE__ */ jsx("li", { className: "px-5 py-4 hover:bg-pm-elevated/50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-pm-text truncate", children: appointment.title }),
          /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${getStatusBadge(appointment.status)}`, children: getStatusText(appointment.status) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs text-pm-muted", children: [
            /* @__PURE__ */ jsx("svg", { className: "flex-shrink-0 mr-1 h-3.5 w-3.5 text-pm-dim", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
            format(new Date(appointment.date_time), "PPP 'a las' p", { locale: es })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center text-xs text-pm-muted", children: [
            /* @__PURE__ */ jsx("svg", { className: "flex-shrink-0 mr-1 h-3.5 w-3.5 text-pm-dim", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            appointment.duration_minutes,
            " min"
          ] })
        ] }),
        appointment.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-pm-dim", children: appointment.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 flex items-center gap-2", children: [
        userRole === "provider" && appointment.status === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStatusUpdate(appointment.id, "confirmed"),
              className: "px-3 py-1.5 bg-green-600/80 hover:bg-green-600 text-white text-xs font-medium rounded-lg border border-green-600/30 transition-colors",
              children: "Confirmar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStatusUpdate(appointment.id, "cancelled"),
              className: "px-3 py-1.5 bg-red-600/70 hover:bg-red-600 text-white text-xs font-medium rounded-lg border border-red-600/30 transition-colors",
              children: "Rechazar"
            }
          )
        ] }),
        userRole === "provider" && appointment.status === "confirmed" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStatusUpdate(appointment.id, "completed"),
              className: "px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium rounded-lg border border-blue-600/30 transition-colors",
              children: "Completar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStatusUpdate(appointment.id, "cancelled"),
              className: "px-3 py-1.5 bg-pm-elevated hover:bg-pm-border text-pm-muted text-xs font-medium rounded-lg border border-pm-border transition-colors",
              children: "Cancelar"
            }
          )
        ] }),
        userRole === "client" && (appointment.status === "pending" || appointment.status === "confirmed") && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleCancelAppointment(appointment.id),
            className: "px-3 py-1.5 bg-red-600/70 hover:bg-red-600 text-white text-xs font-medium rounded-lg border border-red-600/30 transition-colors",
            children: "Cancelar"
          }
        )
      ] })
    ] }) }, appointment.id)) }) })
  ] });
}

export { AppointmentList as A };
