# DISCOVER Analytics — Design System

Tema **oscuro ejecutivo**. Más sobrio que Discover consumidor: canvas grafito, superficies limpias y un acento champagne contenido. Usuarios = dueños y líderes de negocio.

## Color

| Token | HEX | Uso | Contraste (aprox.) |
|---|---|---|---|
| Night | `#0F1419` | Fondo profundo, texto sobre CTA | — |
| Graphite | `#1A1D23` | Lienzo base | — |
| Steel | `#252932` | Superficies, tarjetas | — |
| Slate | `#3A3F4B` | Bordes, divisores | — |
| Fog | `#6D7484` | Bordes fuertes, estados inactivos | no usar como texto pequeño |
| Cloud | `#B4BBC8` | Texto secundario, ejes | ~7.5:1 sobre Steel (AA+) |
| Pearl | `#E8EAF0` | Texto principal, títulos | ~14:1 sobre Graphite (AAA) |
| Champagne | `#C9A86D` | CTA, acento, serie 1 | ~8:1 texto night sobre champagne (AA+) |

Series de gráficas: `#C9A86D` → `#6B8CAE` → `#7FA885` → `#9B869B`. Alerta / caída `#C67B6B`. Positivo `#7FA885`. Fondo de plot **transparente**.

Validación WCAG AA: texto perla y cloud sobre graphite/steel; CTA champagne con ink night; sage y terracotta como estados semánticos (≥ 4.5:1 sobre graphite). Fog no se usa como copy de cuerpo.

## Superficies (`.surface-card`)

- `backdrop-filter: blur(18px) saturate(115%)`
- Fill `rgba(37, 41, 50, 0.82)`
- Border `rgba(180, 187, 200, 0.12)`
- Sombra `0 10px 36px rgba(0, 0, 0, 0.32)`
- Radio **0.85rem**
- CTA sólido champagne — nunca glass en botones
- Fallback: `@supports not (backdrop-filter)` y `prefers-reduced-transparency: reduce` → steel opaco

Header: `.shell-header` (blur 18px, fill ~78%).

Fondo: `.app-backdrop` (radiales champagne / slate blue / sage, muy bajos) + `--discover-graphite`.

## Tipografía

- **Blogh** — display (mayúsculas, tracking amplio). Títulos de sección.
- **ZT Glora Pro** — UI
  - ExtraLight (200) — metadatos
  - Light (300) — cuerpo
  - Regular (400) — controles, cifras KPI

Jerarquía: título de negocio (pregunta) → definición breve → cifra o gráfica. Más aire entre bloques que en Discover consumidor.

## Logo

Wordmark **perla** sobre oscuro. Subtítulo **Analytics** (no el tagline juvenil de Discover). Champagne solo en CTA o acento.

## Componentes

- **KPI**: label uppercase cloud, cifra perla tabular, hint de alcance.
- **Filtros**: chips transparentes; activo = champagne sólido.
- **Gráficas**: ejes cloud, grid al 10% de perla, tooltip steel.
- **Vacío / error**: explicación + siguiente paso; sin dramatismo.

## Copy

Español ejecutivo. Fuente: [`src/copy.ts`](../src/copy.ts). Guía: [`docs/voice-and-tone.md`](voice-and-tone.md).
