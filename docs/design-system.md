# DISCOVER Analytics — Design System

Light-first + **glassmorphism**. **The Friend.** Tagline: *4 Friends, By Friends.*  
Canvas mist con blobs/gradientes; cards y charts en vidrio que difractan el fondo.

## Color

| Token | HEX | Uso |
|---|---|---|
| Paper / Mist | `#FFFFFF` / `#F7F7F4` | Fallback sólido / base |
| Obsidian | `#000000` | Wordmark, ink, focus, borde CTA |
| Yellow DISCOVER | `#F3F188` | CTA sólido, blobs, highlights |
| Storm | `#6B6D78` | Labels, ejes |
| Plum soft | `#C9A8C8` | Orb de fondo (baja sat) |

Charts: `#C9C65A` → `#A894C9` → `#7A9BC4` → `#C9A8C8`. Alerta `#C45A45`. Fondo de plot **transparent** para que se vea el glass.

## Glass (`.surface-card`)

Receta light de producción:

- `backdrop-filter: blur(14px) saturate(140%)` (+ `-webkit-`)
- Fill `rgba(255,255,255,0.62)`
- Border `rgba(255,255,255,0.75)`
- Shadow suave; blur máx. **16px**
- CTA **sólido** (amarillo) — no glass en botones
- Fallback: `@supports not (backdrop-filter)` y `prefers-reduced-transparency: reduce` → paper opaco

Header: `.shell-header` (blur 12px, fill ~55%).

Fondo: `.hero-glow` (radiales) + `.bg-orbs` (blobs amarillo / plum / ink / fog).

## Tipografía

- **Blogh** — display. **ZT Glora Pro** — UI.

## Logo

Wordmark **negro** sobre mist/glass. Amarillo en CTA o bloque sólido.

## Copy

- La noche está en DISCOVER.
- Aquí va a estar el parche cuando haya data.
