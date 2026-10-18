# DISCOVER Analytics — Design System

Tema **oscuro ejecutivo** para un producto de datos: canvas grafito, superficies planas y un acento champagne contenido. Usuarios = dueños y líderes. Menos ruido que Discover consumidor.

Implementación: Tailwind v4 + shadcn/ui restilado a estos tokens (`src/components/ui`, `DESIGN.md`). El login no lleva header de producto. Cifras de ingresos: `es-CO` + sufijo `COP`, sin notación compacta.

Criterio visual: skill `design-taste-frontend` (Leonxlnx/taste-skill, commit `f624f37a8c650b9cc550253104925efe4c8de246`), adaptada a un panel (no a una landing). Diales: variación baja, movimiento sutil, densidad media. Sin fotos decorativas, sin emojis, un solo set de íconos (Phosphor, peso regular).

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

El acento ocupa poco de cada pantalla. El resto es tono: graphite / steel / pearl.

## Superficies

Sin vidrio, sin sombras en reposo, sin degradados ni orbes. Una superficie se distingue del lienzo por un paso de tono (`--color-surface`). Radio **0.5rem**. El CTA es champagne plano.

Header: `.shell-header` sólido night. Fondo: `.app-backdrop` graphite plano.

## Tipografía

- **Blogh** — solo el wordmark DISCOVER.
- **ZT Glora Pro** — toda la UI. Títulos de sección en frase (no versales).
- Escala corta: small 13px, body 17px, lead 20px, título de página ~34px, KPI fluido.
- Cifras: `tabular-nums`.

## Componentes

- **KPI**: tres cifras (ingresos, asistencia, órdenes). Label sentence-case, cifra grande.
- **Filtros**: chips en graphite; activo = slate. Champagne no se usa en chips.
- **Gráficas**: ejes cloud, grid muy suave (funcional, no decorativo), tooltip steel.
- **Carga**: skeleton con la forma del panel.
- **Vacío / error**: explicación + siguiente paso. Ícono Phosphor único.
- **Ejemplo**: banner “datos de ejemplo” cuando se entra con *Ver un panel de ejemplo*.

## Motion

Solo `opacity` y `transform`. Hover/pressed en botones, pulso del skeleton. `prefers-reduced-motion: reduce` apaga animaciones.

## Copy

Español ejecutivo, usted/su. Fuente: [`src/copy.ts`](../src/copy.ts). Guía: [`docs/voice-and-tone.md`](voice-and-tone.md).
