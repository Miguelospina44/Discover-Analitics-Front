import Image from "next/image";

export type LogoVariant =
  | "primary"
  | "secondary"
  | "compact"
  | "stacked"
  | "mark";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  /** Champagne wordmark; default is pearl on dark */
  inverted?: boolean;
};

/**
 * Logo usage for Analytics (more reserved than consumer Discover):
 * A primary  — wordmark + Analytics (login, empty)
 * B secondary — wordmark only (header)
 * C compact  — tighter lockup
 * D stacked  — non-horizontal
 * E mark     — brand seal
 */
export function DiscoverLogo({
  variant = "secondary",
  className = "",
  inverted = false,
}: LogoProps) {
  const color = inverted ? "var(--discover-champagne)" : "var(--discover-pearl)";
  const tagColor = inverted ? "var(--discover-night)" : "var(--discover-cloud)";

  if (variant === "mark") {
    return (
      <Image
        src="/brand/logo_2.png"
        alt="DISCOVER Analytics"
        width={40}
        height={40}
        className={className}
        priority
      />
    );
  }

  if (variant === "stacked") {
    return (
      <div className={className} style={{ textAlign: "center" }}>
        <div className="font-blogh" style={{ color, fontSize: "1.35rem", lineHeight: 1.1 }}>
          DISCOVER
        </div>
        <div
          className="font-glora-xl"
          style={{
            color: tagColor,
            fontSize: "0.58rem",
            letterSpacing: "0.22em",
            marginTop: "0.45rem",
            textTransform: "uppercase",
          }}
        >
          Analytics
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={className} style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
        <span className="font-blogh" style={{ color, fontSize: "1.05rem" }}>
          DISCOVER
        </span>
        <span
          className="font-glora-xl"
          style={{ color: tagColor, fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          Analytics
        </span>
      </div>
    );
  }

  if (variant === "primary") {
    return (
      <div className={className}>
        <div className="font-blogh" style={{ color, fontSize: "clamp(1.7rem, 4.5vw, 2.4rem)" }}>
          DISCOVER
        </div>
        <div
          className="font-glora-xl"
          style={{
            color: tagColor,
            fontSize: "0.72rem",
            letterSpacing: "0.28em",
            marginTop: "0.55rem",
            textTransform: "uppercase",
          }}
        >
          Analytics
        </div>
      </div>
    );
  }

  return (
    <span className={`font-blogh ${className}`} style={{ color, fontSize: "1.15rem" }}>
      DISCOVER
    </span>
  );
}
