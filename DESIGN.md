# DISCOVER Analytics — DESIGN.md

Panel Operate para dueños de ocio nocturno. Una pregunta de negocio, pocas cifras, un acento.

## Stack

- Tailwind v4 + shadcn/ui (new-york), **restilado** a Discover. No preset zinc.
- Tokens: `src/app/tokens.css` → `src/app/globals.css` (`@theme inline`).
- Íconos de producto: **Phosphor Regular**. Lucide es solo default del CLI de shadcn; no se importa en UI.
- Copy: `src/copy.ts`. Usted/su. Español.

## Paleta

| Rol | Token | HEX |
|---|---|---|
| Lienzo | `--bg` | `#161A20` |
| Inset / login | `--bg-deep` | `#0F1419` |
| Superficie | `--surface` / `--card` | `#1E232C` |
| Superficie 2 | `--surface-2` / `--muted` (shadcn) | `#2A303A` |
| Texto | `--ink` / `--foreground` | `#E8EAF0` |
| Texto secundario | `--muted-foreground` | `#B4BBC8` |
| CTA | `--primary` | `#C9A86D` |
| Texto sobre CTA | `--primary-foreground` | `#0F1419` |
| Alta / error | `--up` / `--down` | `#7FA885` / `#C67B6B` |

Champagne &lt; 5 % de cada pantalla. Sin `$` de dólar: cifras `45.830.000 COP`.

## Forma

- Radio 8px (`--radius`). Sin pills, sin sombra en reposo, sin vidrio, sin borde hairline.
- Controles 44px de alto. Foco 2px champagne.
- Blogh solo en DISCOVER. Glora en el resto. Cifras `tabular-nums`.

## Superficies del MVP

- `/login`: sin header ni footer de producto. Wordmark + formulario + ejemplo.
- `/`: skip link, header (logo, cuenta en desktop, Cerrar sesión). Hero de ingresos + asistencia y órdenes. Sector plano (asistencia y órdenes). Dos series por noche + audiencia (género y género × edad) al final.
- Cuentas de prueba en login solo fuera de producción.
- Ingresos: `revenueFromField()` en `src/lib/metrics.ts` (identidad hasta confirmar el contrato). No hay promedio de ingresos del sector en el API.

## Responsive

- ≥ 1080: hero de ingresos al lado del par de KPIs.
- 720–1079: hero a ancho completo, par debajo.
- ~390: columna única; audiencia en barras, no donut; header sin nombre de cuenta.
