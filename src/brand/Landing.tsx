import Link from "next/link";
import { DiscoverLogo } from "./DiscoverLogo";

type ValueProp = {
  eyebrow: string;
  title: string;
  body: string;
};

const VALUE_PROPS: ValueProp[] = [
  {
    eyebrow: "Tu público",
    title: "Entendé quién es tu público",
    body: "Quién llena la pista noche a noche: mix de género, asistencia y las caras que vuelven. Sin ser analista.",
  },
  {
    eyebrow: "El gremio",
    title: "Tendencias del mercado",
    body: "Cómo se mueve el parche más allá de tu club. Comparate con el promedio anónimo del gremio, sin exponer a nadie.",
  },
  {
    eyebrow: "Lo que viene",
    title: "Predicciones para tu próximo finde",
    body: "Anticipá la noche: qué esperar el viernes y el sábado para planear cupo, staff y recaudo con cabeza.",
  },
];

export function Landing() {
  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "3.5rem 1.5rem 4rem" }}>
      <section
        className="surface-card pattern-stamp"
        style={{
          padding: "clamp(2.25rem, 6vw, 4rem)",
          textAlign: "center",
          borderTop: "3px solid var(--discover-yellow)",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.75rem" }}>
          <DiscoverLogo variant="primary" />
        </div>
        <h1
          className="font-glora-xl"
          style={{
            color: "var(--discover-obsidian)",
            fontSize: "clamp(1.75rem, 5.5vw, 3rem)",
            lineHeight: 1.15,
            margin: "0 auto 1.25rem",
            maxWidth: 640,
            fontWeight: 200,
          }}
        >
          La brújula de tu público.
        </h1>
        <p
          className="font-glora-l"
          style={{
            color: "var(--discover-ink-soft)",
            fontSize: "clamp(1rem, 2.4vw, 1.25rem)",
            lineHeight: 1.6,
            maxWidth: 560,
            margin: "0 auto 2rem",
            fontStyle: "italic",
          }}
        >
          Estudios y métricas de panas a panas. Entendé tu noche, seguí al gremio y
          adelantate a tu próximo finde.
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.85rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/login" className="btn-discover" style={{ borderBottom: "none" }}>
            Entrar
          </Link>
          <a
            href="#que-hace"
            className="font-glora"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.75rem 1.35rem",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--discover-obsidian)",
              background: "rgba(255,255,255,0.55)",
              color: "var(--discover-obsidian)",
              borderBottom: "1px solid var(--discover-obsidian)",
            }}
          >
            Ver qué hace
          </a>
        </div>
      </section>

      <section id="que-hace" style={{ marginBottom: "2.5rem" }}>
        <p
          className="font-blogh"
          style={{
            color: "var(--discover-obsidian)",
            fontSize: "0.95rem",
            textAlign: "center",
            margin: "0 0 1.5rem",
          }}
        >
          Lo que vas a descubrir
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {VALUE_PROPS.map((vp) => (
            <article
              key={vp.title}
              className="surface-card"
              style={{ padding: "1.75rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}
            >
              <span
                className="font-glora-xl"
                style={{
                  color: "var(--discover-storm)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {vp.eyebrow}
              </span>
              <h2
                className="font-glora"
                style={{ color: "var(--discover-obsidian)", fontSize: "1.15rem", margin: 0 }}
              >
                {vp.title}
              </h2>
              <p
                className="font-glora-l"
                style={{ color: "var(--discover-ink-soft)", margin: 0, lineHeight: 1.55 }}
              >
                {vp.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="surface-card"
        style={{
          padding: "clamp(1.75rem, 4vw, 2.5rem)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        <p
          className="font-glora-xl"
          style={{
            color: "var(--discover-obsidian)",
            fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)",
            fontWeight: 200,
            margin: 0,
            maxWidth: 520,
          }}
        >
          La noche está en DISCOVER.
        </p>
        <Link href="/login" className="btn-discover" style={{ borderBottom: "none" }}>
          Entrar al parche
        </Link>
      </section>
    </main>
  );
}
