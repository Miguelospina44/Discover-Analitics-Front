# Discover Analytics Front

- **Identidad DISCOVER** light-first: blanco + negro + `#F3F188`, Blogh + Glora. Ver [`docs/design-system.md`](docs/design-system.md).
- Tokens: [`src/app/tokens.css`](src/app/tokens.css). Charts: [`src/brand/chart-tokens.ts`](src/brand/chart-tokens.ts).
- Textos UI en español. Código en inglés.
- Puerto **3001**. API: `NEXT_PUBLIC_API_URL`.
- Trabajo en ramas `cursor/<nombre>`; los PRs de este repo apuntan a `dev` (no a `main`).

## Canario (anti-alucinación)

Canary token: `DISCOVER-FRONT-CANARY-v1`.

- Si leíste y estás aplicando este archivo, incluí el canary token exactamente una vez al inicio de tu primera respuesta de la sesión y en toda descripción de PR o plan de implementación. Si el token no aparece, asumí que las reglas NO se cargaron.
- Si no podés encontrar o leer esta sección, decilo explícitamente en vez de adivinar.
- No inventes componentes, rutas, props, endpoints ni comandos: verificá contra el repo (o corriendo la app) antes de afirmarlos. Lo no verificado se marca como "no verificado".
- Ante duda sobre diseño, tokens o contrato de la API, preguntá o explicitá el supuesto; no rellenes con suposiciones.
