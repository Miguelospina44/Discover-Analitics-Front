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
  refreshing: "Actualizando",
  retry: "Volver a intentar",
  skipToContent: "Ir al contenido",
  main: "Contenido principal",

  nav: {
    panel: "Panel",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    accountFallback: "cuenta",
    session: "Sesión",
  },

  footer: "DISCOVER Analytics. Indicadores para decidir con claridad.",

  login: {
    title: "Acceso al panel",
    intro: "Consulte ingresos, asistencia y rendimiento por noche de su operación.",
    email: "Correo",
    password: "Contraseña",
    submit: "Iniciar sesión",
    submitting: "Verificando acceso…",
    demoHint: "Cuentas de prueba",
    preview: "Ver un panel de ejemplo",
  },

  demo: {
    banner:
      "Está viendo datos de ejemplo. No corresponden a una operación real y sirven solo para revisar el panel.",
    exit: "Salir del ejemplo",
  },

  dashboard: {
    title: "¿Cómo fue el rendimiento de su operación?",
    introAdmin: "Vista consolidada de clientes, con una referencia anónima del sector.",
    introOwner: "Ingresos, asistencia y órdenes del periodo que usted eligió.",
    scopeGlobal: "Todos los clientes",
    scopeClient: "Cliente",
    scopeBusiness: "Su negocio",
    kpis: {
      revenue: "Ingresos",
      attendance: "Asistencia",
      orders: "Órdenes",
      perNight: (value: string) => `${value} por noche`,
      vsSectorAbove: (pct: string) => `${pct} % por encima del promedio del sector`,
      vsSectorBelow: (pct: string) => `${pct} % por debajo del promedio del sector`,
    },
    sector: {
      title: "Frente al sector",
      note: "Promedio anónimo de establecimientos comparables. Es una referencia, no un ranking.",
      attendance: "Asistencia por noche",
      orders: "Órdenes por noche",
      hint: "promedio del sector",
      revenuePending:
        "La comparación de ingresos con el sector queda pendiente: el contrato actual no envía un promedio de ingresos.",
    },
    empty: {
      title: "Sin datos en este periodo",
      body: "No hay métricas para el rango seleccionado. Puede deberse a que aún no se sincronizan ventas o a que no hubo actividad. Ajuste el periodo o los filtros.",
    },
    salesGenderNote:
      "El recorte por audiencia no aplica a ingresos: esa dimensión no está disponible en ventas.",
  },

  filters: {
    legend: "Filtros",
    period: "Periodo",
    from: "Desde",
    to: "Hasta",
    clear: "Quitar filtros",
    client: "Cliente",
    venue: "Establecimiento",
    audience: "Audiencia",
  },

  charts: {
    gender: {
      title: "¿Quién conforma su audiencia?",
      definition: "Composición de la asistencia registrada según género.",
    },
    attendance: {
      title: "¿Cómo se comportó la asistencia por noche?",
      definition: "Personas que ingresaron con boletería o cover, por fecha y establecimiento.",
    },
    sales: {
      title: "¿Cuánto ingresó cada noche?",
      definition: "Ingresos de boletería y covers vendidos con Discover, por fecha.",
    },
    people: "Personas",
    cop: "COP",
    venueFallback: (index: number) => `Establecimiento ${index}`,
  },

  gender: {
    woman: "Mujer",
    man: "Hombre",
    other: "Otro",
    undisclosed: "Sin dato",
  },

  errors: {
    metrics: "No se pudieron cargar las métricas. Verifique su conexión e intente de nuevo.",
    apiUnreachable:
      "No se pudo conectar con el servicio. Verifique que esté disponible e intente de nuevo.",
    credentials: "El correo o la contraseña no son correctos.",
  },

  roles: {
    super_admin: "Administración",
    account_owner: "Dirección",
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
