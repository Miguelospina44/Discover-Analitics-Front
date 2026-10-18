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
  inverted?: boolean;
};

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
        width={32}
        height={32}
        className={className}
        priority
      />
    );
  }

  if (variant === "stacked" || variant === "compact" || variant === "primary") {
    const size =
      variant === "primary" ? "clamp(1.55rem, 4vw, 2.1rem)" : variant === "compact" ? "1rem" : "1.25rem";
    return (
      <div className={className}>
        <div className="font-blogh" style={{ color, fontSize: size, lineHeight: 1.1 }}>
          DISCOVER
        </div>
        <div
          className="font-glora"
          style={{
            color: tagColor,
            fontSize: variant === "primary" ? "0.72rem" : "0.58rem",
            letterSpacing: "0.18em",
            marginTop: variant === "primary" ? "0.45rem" : "0.28rem",
            textTransform: "uppercase",
          }}
        >
          Analytics
        </div>
      </div>
    );
  }

  return (
    <span className={`font-blogh ${className}`} style={{ color, fontSize: "1.05rem" }}>
      DISCOVER
    </span>
  );
}
