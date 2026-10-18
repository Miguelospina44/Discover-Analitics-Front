/**
 * UI copy for Discover Analytics.
 * Spanish, executive tone for owners and business leads.
 * See docs/voice-and-tone.md.
 */

export const copy = {
  meta: {
    title: "DISCOVER Analytics",
    description:
      "Indicadores de ingresos, asistencia y rendimiento para dueños y líderes de establecimientos.",
  },

  loading: "Cargando datos…",
  refreshing: "actualizando datos",
  retry: "Volver a intentar",

  nav: {
    panel: "Panel",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    accountFallback: "cuenta",
  },

  footer: "DISCOVER Analytics — Indicadores para decidir con claridad",

  login: {
    intro: "Acceda a los indicadores de su operación: ingresos, asistencia y rendimiento por noche.",
    email: "Correo",
    password: "Contraseña",
    submit: "Iniciar sesión",
    submitting: "Verificando acceso…",
    demoHint: "Accesos de demostración",
  },

  dashboard: {
    introAdmin:
      "Vista consolidada de todos los clientes, con referencia anónima del sector para comparar rendimiento.",
    introOwner: (accountName: string) =>
      `Panel de ${accountName}. Resultados de su operación frente al promedio anónimo del sector.`,
    scopeGlobal: "todos los clientes",
    scopeClient: "cliente",
    scopeBusiness: "su negocio",
    kpis: {
      attendance: "Asistencia registrada",
      orders: "Órdenes procesadas",
      revenue: "Ingresos",
      women: "Audiencia femenina",
      men: "Audiencia masculina",
    },
    sector: {
      title: "¿Cómo se compara con el sector?",
      note: "Promedios anónimos de establecimientos comparables. Sirven como referencia de mercado, no como ranking.",
      avgAttendance: "Promedio de asistencia por noche",
      medianAttendance: "Mediana de asistencia",
      avgOrders: "Promedio de órdenes por noche",
      sample: "Negocios en la muestra",
      nightsHint: (nights: number) =>
        nights === 1 ? "1 noche registrada" : `${nights} noches registradas`,
      women: "Audiencia femenina del sector",
      men: "Audiencia masculina del sector",
      hint: "promedio del sector",
    },
    empty: {
      title: "Sin datos en este periodo",
      body: "No hay métricas para el rango seleccionado. Puede deberse a que aún no se sincronizan ventas o a que no hubo actividad. Ajuste el periodo o los filtros e intente de nuevo.",
    },
    salesGenderNote:
      "El recorte por audiencia no aplica a ingresos: esa dimensión no está disponible en ventas.",
  },

  filters: {
    period: "Periodo",
    from: "Desde",
    to: "Hasta",
    clear: "Restablecer filtros",
    client: "Cliente",
    venue: "Establecimiento",
    audience: "Audiencia",
  },

  charts: {
    gender: {
      title: "¿Quién conforma su audiencia?",
      definition:
        "Composición de la asistencia registrada según género, en el periodo seleccionado.",
    },
    attendance: {
      title: "¿Cómo se comportó la asistencia por noche?",
      definition:
        "Personas que ingresaron con boletería o cover en cada fecha, por establecimiento.",
    },
    sales: {
      title: "¿Cuánto ingresó cada noche?",
      definition:
        "Órdenes e ingresos de boletería y covers vendidos con Discover, por fecha y establecimiento.",
    },
    people: "Personas",
    venueFallback: (index: number) => `Establecimiento ${index}`,
  },

  gender: {
    woman: "Mujer",
    man: "Hombre",
    other: "Otro",
    undisclosed: "Sin dato",
  },

  errors: {
    metrics:
      "No se pudieron cargar las métricas. Verifique su conexión e intente de nuevo.",
    apiUnreachable:
      "No se pudo conectar con el servicio. Verifique que esté disponible e intente de nuevo.",
    credentials: "El correo o la contraseña no son correctos.",
  },

  roles: {
    super_admin: "Administración",
  },
} as const;

export function roleLabel(role: string): string {
  if (role in copy.roles) return copy.roles[role as keyof typeof copy.roles];
  return role.replaceAll("_", " ");
}

export function genderLabel(id: string): string {
  if (id in copy.gender) return copy.gender[id as keyof typeof copy.gender];
  return id;
}
