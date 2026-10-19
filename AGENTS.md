# Discover Analytics Front

- **Identidad Analytics** dark-first: grafito + perla + champagne `#C9A86D`. Superficies planas. Tipografía Blogh (wordmark) + Glora (UI). Ver [`DESIGN.md`](DESIGN.md), [`docs/design-system.md`](docs/design-system.md) y [`docs/voice-and-tone.md`](docs/voice-and-tone.md).
- Tokens: [`src/app/tokens.css`](src/app/tokens.css). Tailwind v4 + shadcn restilado (`src/components/ui`). Charts: [`src/brand/chart-tokens.ts`](src/brand/chart-tokens.ts). Copy UI: [`src/copy.ts`](src/copy.ts).
- Ingresos: `revenueFromField()` en [`src/lib/metrics.ts`](src/lib/metrics.ts). No dividir `revenue_cents` entre 100 hasta confirmar el contrato. No inventar promedio de ingresos del sector.
- Íconos: Phosphor (`@phosphor-icons/react`), un solo peso. Sin emojis. No importar Lucide.
- Textos UI en español (tono ejecutivo, usted). Código en inglés.
- Puerto **3001**. API: `NEXT_PUBLIC_API_URL`. Panel de ejemplo: *Ver un panel de ejemplo* en `/login` (datos claramente ficticios).
