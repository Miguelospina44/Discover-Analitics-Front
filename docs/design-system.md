# DISCOVER Analytics — Design System

Tema **oscuro ejecutivo** para un producto de datos: canvas grafito, superficies planas y un acento champagne contenido. Usuarios = dueños y líderes.

Implementación: Tailwind v4 + shadcn/ui restilado (`src/components/ui`, `DESIGN.md`). Login sin header. Cifras: `es-CO` + `COP`. Ingresos pasan por `revenueFromField()`; no se divide entre 100 hasta confirmar el contrato.

Criterio visual: skill `design-taste-frontend` adaptada a un panel (no a una landing). Variación baja, movimiento sutil, densidad media. Phosphor Regular. Sin emojis.

## Color

| Token | HEX | Uso | Contraste |
|---|---|---|---|
| Night | `#0F1419` | Barra superior, texto sobre CTA | — |
| Graphite | `#161A20` | Lienzo | — |
| Steel | `#1E232C` | Superficies | — |
| Slate | `#2A303A` | Superficie activa, skeleton | — |
| Fog | `#6D7484` | No usar como texto de cuerpo | — |
| Cloud | `#B4BBC8` | Texto secundario | AA+ sobre graphite/steel |
| Pearl | `#E8EAF0` | Texto principal | AAA sobre graphite |
| Champagne | `#C9A86D` | Único acento (CTA y un aviso) | AA texto night sobre champagne |

Series: `#C9A86D` → `#6B8CAE` → `#7FA885` → `#9B869B`. Alerta `#C67B6B`. Positivo `#7FA885`.

## Superficies

Sin vidrio, sin sombras en reposo, sin degradados. Radio **8px**. Header `.shell-header` night. Skip link champagne al foco.

## Tipografía

- **Blogh** — solo el wordmark DISCOVER.
- **ZT Glora Pro** — toda la UI. Títulos en frase.
- Escala: 13 / 16 / 20 / 28 / 40 (KPI hero). Móvil: H1 ~26px.
- Cifras: `tabular-nums`. Periodo: `1–14 ago 2026`.

## Panel

- **KPIs:** hero ingresos a la izquierda (≥1080) o arriba; asistencia y órdenes al lado. Una pista cada uno (periodo o vs sector). Nunca repetir el nombre del negocio.
- **Sector:** dos cifras planas (asistencia y órdenes). Sin promedio de ingresos: el contrato no lo envía.
- **Filtros:** periodo nativo, ToggleGroup de local; cliente solo `super_admin`; audiencia secundaria.
- **Gráficas:** asistencia e ingresos por noche (`revenue_cents` convertido); audiencia donut en desktop y barras en móvil; género × edad en barras agrupadas (escritorio) y apiladas horizontales (móvil). Tooltip con unidad. `accessibilityLayer`.
- **Estados:** skeleton con forma de panel; vacío con siguiente paso; error con reintentar; demo etiquetado.

## Motion

Solo `opacity` y `transform`. `prefers-reduced-motion: reduce` apaga animaciones.

## Copy

Español ejecutivo, usted/su. Fuente: [`src/copy.ts`](../src/copy.ts). Guía: [`voice-and-tone.md`](voice-and-tone.md).
