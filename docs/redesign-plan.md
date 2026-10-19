# Plan de reforma visual — DISCOVER Analytics

**Estado:** aprobado por Miguel (2026-10-18). Pregunta 1: **Tailwind v4 + shadcn restilado**. Fases 1–5 implementadas en este PR.

**Producto:** panel de indicadores para dueños y líderes de bares, discotecas y locales. Next.js 15, React 19, Recharts 3, tokens CSS propios, copy en `src/copy.ts`. Puerto 3001.

**Modo (Impeccable):** **Operate**. El visitante completa una tarea (leer tres cifras, comparar con el sector, recortar por periodo/establecimiento). Ambición = precisión y contención, no teatro de landing.

**Datos de ejemplo:** nombres y cifras ficticias, etiquetadas como ejemplo (`Sala Norte (ejemplo)`, `ejemplo@discover.test`). Nunca leer ni versionar `.env` ni credenciales.

---

## 0. Skills usadas en este plan

| Skill / herramienta | En este entorno | Uso real en el plan |
|---|---|---|
| **Taste Skill** (`design-taste-frontend`, commit `f624f37a8c650b9cc550253104925efe4c8de246`) | Sí, instalada y leída | House rules adaptadas a panel: sin vidrio, sin emojis, acento escaso, tipos pocos, copy de pregunta. **No** se aplica el inspector de landings (fotos, 8 motions, headlines de 2 líneas). |
| **frontend-design** (Anthropics) | Sí, SKILL leída | Identidad anclada al negocio nocturno ejecutivo; lista de defaults a evitar (eyebrow, dots, cards idénticas, acento en una palabra). |
| **Impeccable** (`pbakaus/impeccable`) | Parcial | Se aplicaron **Operate**, **audit** (5 dimensiones) y **critique** (especificidad, carga cognitiva, heurísticas) sobre código y capturas ya existentes. **No** se ejecutó el binario `impeccable detect`, ni hooks, ni los dos sub-agentes del comando `/critique`. Esa pasada completa queda para la fase de implementación. |
| **shadcn/ui** | Instalado en fases 1–2 | `components.json` (new-york, CSS variables), `src/components/ui/*` restilados a Discover. Sin MCP Shadcn. Íconos de producto: Phosphor (Lucide no se importa). |
| **Superdesign** | Parcial (SKILL + DESIGN.md leídos) | Criterio: un `DESIGN.md` implementable, no “default shadcn”. **No** se pudo abrir el canvas: el CLI exige `superdesign login` y no hay sesión en este entorno. |
| **Modern Web Guidance** (Chrome) | No instalada | El skill file no está en el workspace ni en plugins del agente. Se aplicó criterio de plataforma web actual **por conocimiento** (ver §7) y se marca como no ejecutada de fuente. |
| **Refero** | MCP presente, **sin suscripción** | `NO_SUBSCRIPTION`. No hay pantallas ni estilos reales. |
| **Mobbin** | MCP presente, **plan de pago** | Rechazo de plan. No hay referencias visuales. |

Otras skills del entorno **no** usadas a propósito: Canva brand-check, Figma, canvas de Cursor (el entregable es este documento, no un artefacto paralelo).

Cuando Miguel tenga Refero/Mobbin activos en una sesión con plan, la fase 1 debe **anclar 3–5 pantallas reales** (login, overview de KPIs, gráfica de serie, vacío, error) y no copiar una marca.

---

## 1. Auditoría del estado actual

### 1.1 Mapa de superficies

Solo hay **dos rutas** de producto:

| Ruta | Propósito | Componentes |
|---|---|---|
| `/login` | Acceso + panel de ejemplo | `login/page.tsx`, `DiscoverLogo`, chips `DEMO_LOGINS`, formulario, CTA champagne, botón quiet |
| `/` | Panel autenticado o demo | `page.tsx`, `FilterBar`, `KpiCard` ×3, bloque sector, 3 charts, `EmptyState`, `DashboardSkeleton`, banner demo |

Shell compartido: `AppShell` (header sticky + footer) envuelve **todas** las páginas, incluido el login. Auth: `auth.tsx` (token o `da_demo`). Filtros: query/context en `filters.tsx`.

Estados del panel: datos, `?vista=vacio`, `?vista=carga`, `?vista=error` (solo con demo).

No existen: settings, detalle de noche, tabla, onboarding, 404 propia, recuperación de contraseña, selector de tema.

### 1.2 Inventario de componentes

| Pieza | Archivo | Veredicto |
|---|---|---|
| Tokens + estilos globales | `src/app/tokens.css` | Sistema real, pero con **alias del look viejo** (`--discover-yellow`, `--discover-tomato`, `--discover-paper`…) |
| Tokens de chart | `src/brand/chart-tokens.ts` | Coherente; grid al 6% |
| Copy | `src/copy.ts` | Ejecutivo, usted; kicker «Panel» sobra |
| Logo | `DiscoverLogo.tsx` | Blogh + Analytics; se **repite** en header y login |
| Header/footer | `AppShell.tsx` | Barra night plana; cuenta + Panel + Cerrar sesión pelean en móvil |
| Filtros | `FilterBar.tsx` | Chips de periodo, local, audiencia; densidad alta |
| KPI | `KpiCard.tsx` | Tres cifras; hint duplica el nombre del negocio |
| Bloque de gráfica | `ChartBlock.tsx` | Título pregunta + definición + chart |
| Vacío | `EmptyState.tsx` | Copy bueno; icono Phosphor |
| Skeleton | `Skeleton.tsx` | Forma correcta; pulso ok |
| Charts | `NightlyAttendanceChart`, `SalesByNightChart`, `GenderMixChart` | Recharts; **ventas grafica órdenes, no ingresos** (desalineado con el título) |
| Demo | `demo-data.ts` | Ficticio y etiquetado |
| Estilos | casi todo **inline** en JSX | El sistema de clases no gobierna el layout |

### 1.3 Qué sigue del diseño viejo (consumidor)

Huellas concretas, no de paleta:

1. **Alias de tokens** del mundo amarillo/violeta: `--discover-yellow`, `--ultraviolet`, `--tomato`, `--cornflower`, `--plum`, `--mist`, `--paper`. El champagne vive disfrazado de yellow.
2. Comentario en `metrics.ts`: “glass tiles” — el vidrio ya se quitó, el copy interno no.
3. **`formatMoney` compacto** se ve como `$45,8 M` (screenshot), no como pesos colombianos explícitos.
4. **Chips de demostración** en login (Administración / Miguel's Club) recuerdan el onboarding informal; el apóstrofe inglés en “Miguel's Club” rompe el tono.
5. **Preguntas largas + definición + gráfica + KPI** = el mismo bloque repetido tres veces (kit SaaS, no composición).
6. **Eyebrow** `.page-kicker` (“Panel”) — tell de Taste y de frontend-design.
7. **Meta con puntos medios** (`2026-08-01 → 2026-08-14 · Sala Norte · ejemplo`).
8. **Logo duplicado** (header + tarjeta de login), hábito de la landing.
9. **Outline anulado** en `.chart-crossfilter` y Recharts: atajo viejo contra el foco del gráfico.
10. **`AppShell` en el login**: un producto consumidor ponía nav encima del acceso; un panel ejecutivo suele ser una pantalla de acceso limpia, sin “Panel / Iniciar sesión”.

Lo que **ya no** es el look viejo (y hay que preservar): canvas grafito, CTA champagne, Glora, usted/su, Phosphor, skeleton, banner de datos de ejemplo, tres KPIs en lugar de cinco.

### 1.4 Crítica Impeccable (Operate) — degradada

No se corrió `impeccable detect` ni dos sub-agentes. Síntesis a partir de código + capturas desktop/móvil.

**Especificidad:** media. Un panel de analítica genérica podría usar el mismo layout cambiando el logo. El champagne + Blogh + preguntas en español sí anclan Discover; el resto es “cards + line + donut”.

**Carga cognitiva:** en el fold caben kicker, H1, lead, meta, banner, filtros (periodo + 2 locales + 4 géneros), 3 KPIs y el sector. Más de 4 grupos de decisión visibles a la vez (periodo, local, audiencia, y luego las series).

**Heurísticas (0–4, Operate):**

| Heurística | Nota | Comentario |
|---|---|---|
| Visibilidad de estado | 3 | Banner demo, skeleton, error con reintento |
| Correspondencia sistema/mundo | 2 | “Órdenes” en KPI vs gráfica de ventas que no muestra ingresos; `$` vs COP |
| Control del usuario | 3 | Filtros toggle; falta “todo el periodo” claro |
| Consistencia | 2 | Inline styles vs tokens; chips vs botones vs KPI cards del mismo radio |
| Prevención de error | 2 | Login no marca campos inválidos; fechas nativas sin validación de rango |
| Reconocimiento vs recuerdo | 3 | Preguntas ayudan; el kicker no |
| Flexibilidad | 2 | Sin atajos; super_admin y dueño ven el mismo lienzo |
| Estética / minimalismo | 2 | Sobrio de color, ruidoso de bloques |
| Recuperación de error | 3 | Copy correcto |
| Ayuda | 2 | Definiciones bajo cada chart; no hay “qué significa esta cifra” en el KPI |

**Audit técnico estimado (Impeccable, 0–4):**

| Dimensión | Score | Hallazgo |
|---|---|---|
| Accesibilidad | 2 | Contraste de perla/cloud ok; foco de charts anulado; sin skip-link; fechas nativas poco etiquetadas más allá del aria-label |
| Performance | 3 | dynamic import de Recharts; Redux alias de webpack es deuda |
| Theming | 2 | Tokens existen; hex sueltos y alias legacy |
| Responsive | 2 | Columna única ok; header se aprieta; chips no wrap con target 44px siempre; donut con leyenda apretada |
| Integridad | 2 | Sistema a medias: glass fuera, yellow aliases dentro |
| **Total** | **11/20** | **Aceptable — hace falta una reforma, no un barniz** |

### 1.5 Crítica Taste / frontend-design (adaptada a datos)

Pase de un segundo: se lee “un dashboard oscuro”, no “el rendimiento de *su* local esta quincena”.  
Squint: muchas masas medianas del mismo tamaño (filtro = KPI = sector = chart).  
Acento champagne en CTA **y** en el icono del banner: ya son dos sitios; más y deja de significar.  
Sameness: ChartBlock ×3.  
Móvil: no es una segunda composición; es el desktop apilado. El header es el punto débil.

### 1.6 Fortalezas a no tirar

- Paleta grafito / perla / champagne ya decidida por Miguel.
- Copy de usted y títulos-pregunta.
- Demo claramente falso.
- Tres KPIs (dirección correcta vs. el mar de cifras anterior).
- Phosphor como único set.
- `prefers-reduced-motion` y `color-scheme: dark` ya existen.

---

## 2. Dirección visual final

**Lectura de diseño:** panel Operate para dueños de ocio nocturno, lenguaje grafito nocturno + un metal champagne, densidad media, variación baja, movimiento solo de estado.

**Una idea:** la noche del local es el eje; cada pantalla responde *una* pregunta de negocio con *pocas* cifras grandes. El champagne señala la acción, no la decoración.

**Un gesto memorable (y solo uno):** la cifra de **ingresos** como el objeto más grande de la primera pantalla. El resto calla.

### Paleta (conservar HEX, limpiar roles)

| Rol | Token | HEX | Uso |
|---|---|---|---|
| Ground | `--bg` | `#161A20` | Lienzo |
| Inset | `--bg-deep` | `#0F1419` | Header, login canvas |
| Surface | `--surface` | `#1E232C` | Paneles |
| Surface 2 | `--surface-2` | `#2A303A` | Control activo, skeleton |
| Ink | `--ink` | `#E8EAF0` | Texto y cifras |
| Muted | `--muted` | `#B4BBC8` | Secundario (AA) |
| Accent | `--accent` | `#C9A86D` | CTA primario, 1 marca de foco |
| Accent ink | `--accent-ink` | `#0F1419` | Texto sobre CTA |
| Up | `--up` | `#7FA885` | Delta positivo |
| Down | `--down` | `#C67B6B` | Error / caída |
| Chart 2–4 | slate / sage / mauve | actuales | Series, no UI |

Eliminar alias `--discover-yellow` y familia. Fog `#6D7484` no es texto de cuerpo.

Proporción Taste: ground 70–90 %, ink en texto, **acento &lt; 5 %** de cada pantalla.

### Tipografía

- **Blogh:** solo wordmark DISCOVER. Nunca en labels, botones ni ejes.
- **ZT Glora Pro:** toda la UI. Pesos 300 cuerpo, 400 controles y cifras.
- Escala **fija en rem** (Impeccable Operate: no clamp en títulos de producto): 13 / 16 / 20 / 28 / 40 para KPI.
- Frase, no versales, salvo el wordmark.
- Cifras: `tabular-nums`. Ingresos: `45.830.000 COP` (ver §9.4).
- Medida de lead ≤ 65–75 caracteres.

### Espaciado, bordes, elevación

- Página: padding `clamp(1.25rem, 3vw, 2.5rem)`, max ~1080px (aún más estrecho si el KPI hero lo pide).
- Ritmo: gap interno 12–16px; entre secciones 32–48px (claramente mayor).
- Radio **único 8px** en paneles y controles. No pills. No 6px aquí y 8px allá.
- **Sin sombra en reposo, sin vidrio, sin orbes, sin degradado de fondo.** Superficie = un paso de tono.
- Sombra solo en overlay (tooltip, menú) — lo que “flota”.
- Bordes: de entrada **0**. Si un control no se lee, subir el tono, no añadir hairline.

### Iconografía

- Un set: **Phosphor Regular**, stroke coherente (~1.5).
- Prohibido Lucide “por shadcn”, emojis, iconos decorativos sobre KPIs.
- Icono solo si nombra una acción (cerrar sesión, reintentar, aviso de ejemplo).

### Movimiento

- 150–250 ms, `opacity` + `transform`, ease-out.
- Permitido: hover/pressed de botón, pulso de skeleton, opacidad al refrescar datos.
- Prohibido: entrada staggered de cada bloque, blobs, count-up en cada KPI, page-load cinematic.
- `prefers-reduced-motion: reduce` mantiene el estado, quita el viaje.

### Anti-referencia (no hacer)

- Landing Taste (fotos de archivo, 8 motions, headlines monumentales).
- Default shadcn zinc + Lucide + sidebar.
- Amarillo DISCOVER consumidor, “parche”, pills, glass.
- Cards de KPI anidadas dentro de otra card (Impeccable: *cards in cards*).

---

## 3. Sistema de tokens y componentes

### 3.1 Tokens

Fuente de verdad: `src/app/tokens.css` **más** un `DESIGN.md` corto (recomendación Superdesign) generado *después* de aprobar este plan, no antes.

Roles CSS: `--bg`, `--bg-deep`, `--surface`, `--surface-2`, `--ink`, `--muted`, `--accent`, `--accent-ink`, `--up`, `--down`, `--chart-1..4`, `--radius`, `--space-*`, `--step-*`, `--dur-fast`.

Charts: `src/brand/chart-tokens.ts` lee los mismos roles. Nunca hex suelto en JSX.

### 3.2 ¿Tailwind + shadcn?

**Decisión (Miguel, 2026-10-18):** **Tailwind v4 + shadcn/ui** restilado a Discover. No preset zinc. No sidebar. Phosphor en producto; Lucide no se importa.

Fuente: `components.json`, `src/app/globals.css` (`@theme inline`), primitivos en `src/components/ui`. Utilidad `cn` en `src/lib/utils.ts` (no el paquete npm `cn`).

El dashboard (fase 3+) sigue en clases CSS de `tokens.css` hasta que se migre. `--color-muted` en esa hoja sigue siendo cloud (texto); el `bg-muted` de Tailwind apunta a `--muted` = slate.

### 3.3 Adoptar de shadcn (restilados, Phosphor)

| Componente | Uso en el MVP |
|---|---|
| `Button` | Primario champagne, secundario surface-2, ghost en header |
| `Field` + `Label` + `Input` | Login |
| `Card` | Un panel por sección; **no** card dentro de card |
| `ToggleGroup` | Local y audiencia (en lugar de chips sueltos) |
| `Alert` | Banner de ejemplo y error de métricas |
| `Skeleton` | Carga |
| `Empty` | Periodo sin datos |
| `Separator` | Header / contenido, si hace falta tono y no línea |
| `Tooltip` | Definición de KPI al foco, no un párrafo bajo cada chart |
| `Chart` (`ChartContainer`, tooltip, legend) | Envolver Recharts; `accessibilityLayer`; altura explícita |
| `Badge` | Solo rol del usuario, 1 por pantalla |

### 3.4 No adoptar en el MVP

Sidebar, Command, Calendar (el `input type="date"` nativo basta hasta que el Date Picker se pida), Data Table, Tabs, Theme toggle, Carousel, Accordion, Sonner a granel, diálogos.

### 3.5 Propio (no está en shadcn o es identidad)

- `DiscoverLogo`
- `AppShell` (top bar mínima; **login sin shell de producto**)
- `KpiHero` (ingresos) + `KpiPair` (asistencia / órdenes)
- `FilterBar` (compone ToggleGroup + dates)
- `SectorCompare` (dos cifras planas, no grid de cards)
- Series: asistencia, ingresos, audiencia
- `copy.ts` como única fuente de strings

---

## 4. Guía de visualización de datos

Público: dueño. Pregunta: “¿cómo me fue y contra qué me mido?”. Pocas cifras, grandes, comparables.

### 4.1 KPIs

Orden fijo:

1. **Ingresos** — hero. Tamaño `--step-kpi` (40px). Formato COP explícito.
2. **Asistencia** — secundaria.
3. **Órdenes** — secundaria.

Cada KPI: label en frase, cifra, **una** pista (periodo o vs sector), nunca el nombre del negocio repetido tres veces.

Delta vs sector: sage / terracotta, con texto (“12 % por encima del promedio del sector”), no solo color.

### 4.2 Gráficas

| Chart | Tipo | Métrica real | Notas |
|---|---|---|---|
| Asistencia por noche | Línea, una serie por local | `redeemed_tickets` | Eje Y “Personas”, fechas cortas |
| Ingresos por noche | Línea o barras | **`revenue_cents`**, no `order_count` | Hoy está mal; corregir en implementación |
| Audiencia | Donut **o** barras horizontales al 100 % | share | Preferir barras en móvil (leyenda del donut choca) |

Reglas:

- Plot transparente, grid horizontal mínimo, sin grid vertical.
- Tooltip steel, cifras con unidad.
- Leyenda debajo, no superpuesta; en móvil, lista vertical.
- Click en serie = filtro de local (comportamiento actual, mantener).
- `ChartContainer` con `min-height` fijo (shadcn: ResponsiveContainer no mide 0).
- Máximo **dos** charts en el fold largo; audiencia puede ir al final o como split del KPI de mix, no como tercer poster idéntico.

### 4.3 Tablas

**Fuera del MVP.** Si más adelante: una tabla “por noche” (fecha, asistencia, órdenes, ingresos) bajo las gráficas, `tabular-nums`, sin zebra ruidosa.

### 4.4 Estados

| Estado | Tratamiento |
|---|---|
| Carga inicial | Skeleton con la **forma** del panel (hero + 2 kpi + 1 chart), no spinner centrado |
| Refresh | Opacidad ~0.8 + “Actualizando”; no desmontar charts |
| Vacío | Empty: qué falta, por qué, qué hacer (ajustar periodo). Sin ilustración |
| Error de red | Alert + reintentar. El filtro permanece |
| Error de login | Texto bajo el formulario, `role="alert"`, foco al campo |
| Demo | Alert permanente: no es operación real |

---

## 5. Pantallas del MVP — dentro / fuera

### Dentro

| Pantalla | Propósito | Qué ve el dueño |
|---|---|---|
| Acceso | Entrar o ver ejemplo | Wordmark, una frase, correo, contraseña, CTA, enlace a ejemplo. Sin nav de producto |
| Panel dueño | Decidir con tres cifras y dos tendencias | Hero ingresos, asistencia, órdenes, filtros, vs sector, 2–3 charts |
| Panel administración | Misma IA, recorte por cliente | Toggle de cliente **además** de local |
| Estados del panel | No dejar agujeros | Vacío, carga, error, demo |

### Fuera (para que el MVP siga simple)

- Detalle de una noche, export CSV/PDF, alertas, metas, ranking de locales, mapa, comparador de periodos lado a lado, settings, usuarios, tema claro, onboarding largo, chat, “insights” generativos, más de un acento, fotos de fiesta, sidebar de módulos.

Criterio: si no ayuda a responder “¿cómo fue *esta* quincena?”, no entra.

---

## 6. Copy ejecutivo (usted)

Sigue `docs/voice-and-tone.md`. Cambios previstos (a aplicar en implementación, no ahora):

| Ahora | Propuesto |
|---|---|
| Kicker «Panel» | Quitar |
| «¿Cómo fue el rendimiento de su operación?» | Mantener como H1 del panel |
| «Tres cifras del periodo y la tendencia por noche.» | «Ingresos, asistencia y órdenes del periodo que usted eligió.» |
| «Cuentas de demostración» | «Cuentas de prueba» |
| «Miguel's Club» | «Club de Miguel» o el nombre real del tenant de prueba |
| «Ver un panel de ejemplo» | Mantener |
| «Órdenes procesadas» (histórico) | «Órdenes» |
| Meta `2026-08-01 → 2026-08-14` | «1–14 ago 2026» en español |
| Footer | Mantener |

Estados: sin “Oops”, sin admiración, sin jerga de API (`tickets redimidos` → asistencia). Demo: una frase, no un descargo legal.

Todos los strings siguen en `src/copy.ts`.

---

## 7. Accesibilidad y responsive

### A11y (piso WCAG AA)

- Contraste: perla sobre graphite; cloud solo ≥ 16px; CTA night sobre champagne.
- Foco visible 2px accent; **dejar de anular** outline de Recharts; usar `accessibilityLayer`.
- `html lang="es"`, landmarks (`header`, `main`, `nav`), un H1 por vista.
- Login: labels asociados, error anunciado, `autocomplete`.
- Skip link “Ir al contenido”.
- Icon-only: no hay; Cerrar sesión lleva texto.
- Charts: resumen textual o tabla alternativa colapsable (fase 4 si el tiempo alcanza; si no, `aria-label` de la métrica + tooltip teclado).
- `prefers-reduced-motion` y `prefers-reduced-transparency` (este último ya no aplica si no hay glass).

### Modern Web Guidance (criterio aplicado; skill no cargada)

Usar APIs de plataforma en lugar de polyfills:

- `:focus-visible`, `color-scheme: dark` (ya).
- Popover API / portal para menús; no dropdown dentro de `overflow: hidden`.
- `@media (width < 720px)` o container queries para el grid de KPIs, no JS de breakpoint.
- Fechas: `input type="date"` nativo en MVP; no datepicker JS pesado.
- No `window.location` para auth (ya hay router).
- Animar solo transform/opacity.
- Tipografía con `font-display: swap` (ya).

### Responsive

| Ancho | Composición |
|---|---|
| ≥ 1080 | Hero ingresos a la izquierda o arriba a ancho completo; par asistencia/órdenes al lado; filtros en una fila; charts a 1 columna (más lectura que bento) |
| 720–1079 | KPIs apilados 1+2; filtros wrap |
| ~390 | Header: logo + Cerrar sesión (ocultar cuenta, como ahora). H1 a 24–28px. Filtros en bloque. Charts 240–280px de alto. Audiencia en barras, no donut. Targets ≥ 44px |

Móvil es **segunda composición**, no squeeze. Verificar tocando filtros y el CTA de login, no solo captura.

---

## 8. Fases de implementación

Ninguna fase arranca sin aprobación de este plan y de las preguntas §9 que bloqueen stack (Tailwind/shadcn).

### Fase 0 — Acuerdo (esta)

- Entregable: este documento.
- Criterio: Miguel marca qué se acepta, qué se cambia, respuestas §9.
- Riesgo: implementar de nuevo sin anclar Refero/Mobbin y repetir el look genérico.

### Fase 1 — Cimientos

- Limpiar tokens (matar aliases). `DESIGN.md` corto.
- Decisión de stack: Tailwind+shadcn **o** primitivos propios.
- Si shadcn: `components.json`, theme CSS variables, Phosphor, **cero** Lucide.
- Criterio: `lint`, `typecheck`, `build` verdes; una página de laboratorio de Button/Field/Card en dark Discover, no zinc.
- Riesgo: Tailwind pelea con `tokens.css` actual; mitigar: una sola hoja de variables, utilidades solo en componentes nuevos.

### Fase 2 — Acceso y shell

- Login sin nav de producto. Un wordmark, un formulario, ejemplo.
- Header del panel: logo, nombre de cuenta (desktop), Cerrar sesión. “Panel” activo innecesario si solo hay una vista.
- Criterio: capturas desktop/móvil login + error de credenciales; foco teclado completo; copy de usted.
- Riesgo: cuentas de prueba visibles en producción; mitigar: chips de prueba solo si `NODE_ENV !== production` o flag explícito (sin leer secretos).

### Fase 3 — Panel (IA)

- Hero ingresos + 2 KPIs. Sector como dos números, no cards anidadas.
- Filtros: periodo, local; audiencia secundaria.
- Criterio: dueño entiende las tres cifras en 3 segundos (prueba informal / squint). Demo falso sigue etiquetado.
- Riesgo: recortar de más y perder el recorte por cliente del super_admin; mitigar: ToggleGroup de cliente **solo** si `role === super_admin`.

### Fase 4 — Gráficas y estados

- Corregir serie de ingresos. ChartContainer con altura. Barras de audiencia en móvil.
- Skeleton, vacío, error. Tooltip con unidad.
- Criterio: las tres vistas `datos / vacio / carga / error` en 1280 y 390; SVG visible (no screenshot a fullPage que se traga el canvas).
- Riesgo: Recharts 3 + webpack CJS alias; no tocar arquitectura de datos, solo presentación.

### Fase 5 — Endurecer

- A11y AA, skip link, outlines, contraste revisado.
- Quitar inline styles residuales.
- Actualizar `docs/design-system.md`, `voice-and-tone.md`, `AGENTS.md`.
- Criterio: checklist §7; `lint` / `typecheck` / `build`; capturas before/after de **todas** las superficies del MVP.
- Riesgo: alcance creep (tabla, sidebar). Fuera de esta fase.

**Dependencias:** 0 → 1 → 2 → 3 → 4 → 5. 3 y 4 pueden solaparse cuando el ChartContainer exista.

**No se cambia:** contrato de API, modelo de filtros, auth real, puerto 3001.

---

## 9. Preguntas — decisiones (2026-10-18)

Miguel cerró la pregunta 1. El resto se decide aquí con criterio de panel ejecutivo; se puede revertir.

| # | Pregunta | Decisión | Depende del backend |
|---|---|---|---|
| 1 | Tailwind v4 + shadcn restilado vs primitivos | **Tailwind v4 + shadcn restilado.** Phosphor, sin sidebar. | No |
| 2 | Blogh + Glora | **Se mantienen.** Blogh solo wordmark; Glora UI. | No |
| 3 | Login sin header de producto | **Sí.** `/login` no pinta header ni footer. El shell del panel: logo, cuenta (desktop), Cerrar sesión. Sin enlace «Panel». | No |
| 4 | Formato COP | **Completo, explícito:** `45.830.000 COP` (`es-CO`, sin `$` para no leerse como USD, sin compacto). | **Parcial:** el campo se llama `revenue_cents`. Hasta confirmar el contrato, **no se divide entre 100**; los fixtures de ejemplo ya suman pesos enteros. Si el API envía céntimos reales, habrá que ajustar `formatMoney`. |
| 5 | Serie de ventas = ingresos u órdenes | **Ingresos (`revenue_cents`)**, no `order_count`. El título ya pregunta por ingresos. **Corrección de serie en fase 4** (no en 1–2). | **Sí:** unidad y semántica de `revenue_cents` vs `order_count`. |
| 6 | Audiencia en el MVP | **Se queda.** En fase 3 se simplifica (no es el gesto hero); en fase 4, barras en móvil si el donut choca. | **Sí:** `attendance-by-gender` y códigos `woman/man/other/undisclosed`. |
| 7 | Sector en el MVP | **Se queda**, dos cifras (asistencia y órdenes vs promedio). Sin cards anidadas en fase 3. | **Sí:** `GremialBenchmarks`; no hay benchmark de ingresos en el contrato actual. |
| 8 | Cuentas de prueba en login | **Solo fuera de producción** (`NODE_ENV !== "production"`). En prod queda el CTA «Ver un panel de ejemplo». Campos vacíos al cargar. | No (son fixtures de front; no se leen `.env`) |
| 9 | Refero / Mobbin antes de fase 1 | **Seguir sin anclaje** (sin suscripción en este entorno). Corregir con referencias cuando existan. | No |
| 10 | Superdesign canvas | **Ir a código.** El CLI exige login y no hay sesión. `DESIGN.md` cubre la dirección. | No |
| 11 | Más rutas en el MVP | **No.** Login + panel. Sin recuperar contraseña, 404 propia ni selector de local extra. | Auth de recuperación sería API; fuera de alcance. |

Cifras y series que **siguen al backend** (no inventar en front):

- Unidad de `revenue_cents` (pesos vs céntimos).
- Presencia de ingresos en el benchmark de sector (hoy no viene).
- Códigos y cobertura de audiencia.
- Errores de login 401/400: el mapeo a «correo o contraseña no son correctos» ya vive en `auth.tsx` (no se tocó).

---

## Apéndice A — Wireframe de intención (panel dueño, desktop)

```
[ DISCOVER Analytics          Sala Norte (ejemplo)    Cerrar sesión ]

¿Cómo fue el rendimiento de su operación?
1–14 ago 2026   ·   Sala Norte (ejemplo)

Periodo  [ desde ] [ hasta ]     Local  [ Norte | Sur ]     Audiencia  [ todos ▾ ]

  INGRESOS                         Asistencia        Órdenes
  $ 45,8 mill. COP                 2.092             807
  18 % sobre el promedio sector    por noche 174     por noche 67

Asistencia por noche                         Ingresos por noche
[  línea  Norte / Sur                    ]   [  línea  Norte / Sur              ]
```

Móvil: ingresos full width; asistencia y órdenes apilados; una gráfica por vez.

## Apéndice B — Alcance de este PR (fases 1–5)

Hecho: cimientos Tailwind/shadcn, login y shell, IA del panel (hero de ingresos), serie de ingresos vía `revenueFromField()`, audiencia en barras en móvil, estados carga/vacío/error, skip link, a11y de foco, copy y docs.

No se toca: contrato de API, `src/lib/api.ts`, `src/lib/auth.tsx`, `.env`, credenciales. No hay 404 propia ni tabla por noche.

Pendiente de backend: unidad de `revenue_cents`; promedio de ingresos del sector (no existe en `GremialBenchmarks`).
