const questions = [
  "¿Cuál es el estado actual del estudio?",
  "¿Cuáles son los hallazgos más relevantes?",
  "¿Dónde están las mayores oportunidades o riesgos?",
  "¿Qué recomendaciones requieren decisión?",
  "¿Qué acciones están atrasadas?",
  "¿Qué cambió desde el último corte?",
];

export default function HomePage() {
  const api = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}
    >
      <p style={{ letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-muted)" }}>
        Discover Analytics
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "2.4rem",
          color: "var(--color-petrol)",
          lineHeight: 1.2,
        }}
      >
        Hub de estudios. No es Discover covers ni FUA.
      </h1>
      <p style={{ color: "var(--color-muted)", maxWidth: 640 }}>
        Esta aplicación consume la API en {api}. La identidad es editorial de consultoría: tinta,
        mineral y ámbar. El recaudo NFC vive en Discover.
      </p>
      <ol>
        {questions.map((item) => (
          <li key={item} style={{ marginBottom: "0.6rem" }}>
            {item}
          </li>
        ))}
      </ol>
    </main>
  );
}
