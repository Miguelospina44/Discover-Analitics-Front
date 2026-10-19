# Discover Analytics Front

Panel ejecutivo para dueños y líderes de establecimientos. Canvas grafito, superficies planas y acento champagne.

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3001 — acceso en `/login`. Para ver el panel sin API, use **Ver un panel de ejemplo** (cifras ficticias, etiquetadas como ejemplo).

Estados de revisión (con el ejemplo activo):

- `/?vista=vacio` — panel sin métricas
- `/?vista=carga` — skeleton
- `/?vista=error` — error de métricas
- `/?vista=privacidad` — gráfica de edad × género sin suficientes datos (k-anonimato)
- `/?vista=restringido` — colectivo sin eventos (equivalente a 403)

## Audiencia por género y edad

La gráfica «¿Cómo se reparte su audiencia por edad y género?» consume `GET /api/v1/metrics/audience-by-gender-age` (Back PR #11). Si el endpoint no está disponible, el panel muestra la misma gráfica con las celdas de ejemplo del seed, rotuladas como ejemplo.

Para probarla con datos reales de Discover:

1. En **Discover-Analitics-Back**, arranque el API con `DATA_SOURCE=discover` (vista `016` aplicada y `GRANT SELECT` sobre `analytics.v_audience_by_gender_age`). No hace falta tocar secretos desde este front.
2. En este repo: `NEXT_PUBLIC_API_URL` apuntando al Back (por defecto `http://127.0.0.1:8002`; véase `.env.example`).
3. `npm run dev` → http://localhost:3001/login con una cuenta real.
4. Abra el panel: la gráfica agrupa por rango de edad (18–24 … 55+) con series de género. Menos de 10 personas → estado vacío de privacidad. Colectivo sin eventos → acceso restringido.

Si `is_demo` viene en `true`, se muestra `demo_label` sobre la gráfica.

- Design system: [docs/design-system.md](docs/design-system.md)
- Voz y tono: [docs/voice-and-tone.md](docs/voice-and-tone.md)
- Copy: [src/copy.ts](src/copy.ts)
