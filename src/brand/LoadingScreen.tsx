"use client";

// Pantalla de carga de marca: rota distintos tipos de gráfica mientras explica
// qué se está cargando, con un subtítulo pequeño debajo y un fondo ligeramente
// opaco. Reutilizable como overlay (pantalla completa) o inline (dentro del contenido).

import { useEffect, useState, type ReactNode } from "react";

type ChartKind = "bar" | "line" | "donut" | "area" | "scatter";

// Cada gráfica va con una etiqueta de "qué" se está armando, para que la
// animación también comunique el tipo de análisis que viene en camino.
const SEQUENCE: { kind: ChartKind; caption: string }[] = [
  { kind: "bar", caption: "Asistencia" },
  { kind: "line", caption: "Ventas por noche" },
  { kind: "donut", caption: "Mix de género" },
  { kind: "area", caption: "Tendencias" },
  { kind: "scatter", caption: "Tu público" },
];

type LoadingScreenProps = {
  /** Subtítulo que explica qué se está cargando. */
  subtitle?: string;
  /** true = overlay a pantalla completa con fondo opaco; false = bloque inline. */
  fullscreen?: boolean;
};

export function LoadingScreen({
  subtitle = "Preparando tu parche…",
  fullscreen = false,
}: LoadingScreenProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((prev) => (prev + 1) % SEQUENCE.length), 950);
    return () => clearInterval(id);
  }, []);

  const { kind, caption } = SEQUENCE[i];

  const body = (
    <div className="da-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="da-loader__stage">
        {/* key fuerza el re-render para re-disparar la animación de entrada */}
        <div key={i} className="da-loader__glyph">
          {renderGlyph(kind)}
        </div>
      </div>
      <p className="da-loader__caption font-blogh">{caption}</p>
      <p className="da-loader__subtitle font-glora-l">{subtitle}</p>
      <span className="sr-only">Cargando…</span>
    </div>
  );

  return (
    <div className={fullscreen ? "da-loader-overlay" : "da-loader-inline"}>{body}</div>
  );
}

function renderGlyph(kind: ChartKind): ReactNode {
  const stroke = "var(--discover-obsidian)";
  const common = {
    width: 48,
    height: 48,
    viewBox: "0 0 48 48",
    fill: "none" as const,
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (kind) {
    case "bar":
      return (
        <svg {...common} aria-hidden="true">
          <rect x="7" y="26" width="7" height="15" rx="1.5" fill="var(--chart-1)" />
          <rect x="18" y="18" width="7" height="23" rx="1.5" fill="var(--chart-2)" />
          <rect x="29" y="10" width="7" height="31" rx="1.5" fill="var(--discover-yellow)" />
          <line x1="5" y1="41" x2="43" y2="41" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "line":
      return (
        <svg {...common} aria-hidden="true">
          <polyline
            points="6,34 16,24 24,29 33,14 42,20"
            stroke="var(--chart-3)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="33" cy="14" r="3" fill="var(--discover-yellow)" stroke={stroke} strokeWidth="1.5" />
          <line x1="5" y1="41" x2="43" y2="41" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "donut":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="24" cy="24" r="14" stroke="var(--discover-fog)" strokeWidth="7" />
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="var(--discover-yellow)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="60 88"
            transform="rotate(-90 24 24)"
          />
          <circle
            cx="24"
            cy="24"
            r="14"
            stroke="var(--chart-2)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="26 88"
            strokeDashoffset="-62"
            transform="rotate(-90 24 24)"
          />
        </svg>
      );
    case "area":
      return (
        <svg {...common} aria-hidden="true">
          <path
            d="M6 40 L6 30 L15 22 L23 27 L32 15 L42 21 L42 40 Z"
            fill="rgba(243, 241, 136, 0.5)"
            stroke="var(--chart-3)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line x1="5" y1="41" x2="43" y2="41" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "scatter":
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="13" cy="30" r="3.2" fill="var(--chart-2)" />
          <circle cx="21" cy="20" r="3.2" fill="var(--chart-3)" />
          <circle cx="30" cy="27" r="3.2" fill="var(--chart-4)" />
          <circle cx="36" cy="15" r="3.2" fill="var(--discover-yellow)" stroke={stroke} strokeWidth="1.2" />
          <line x1="5" y1="41" x2="43" y2="41" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="41" x2="6" y2="8" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
