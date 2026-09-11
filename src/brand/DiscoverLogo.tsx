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
  /** Prefer yellow wordmark on black; inverted only on solid yellow blocks */
  inverted?: boolean;
};

/**
 * Logo usage (brandbook):
 * A primary  — wordmark + tagline (splash, login, PDF cover, big empty)
 * B secondary — wordmark only (header, nav)
 * C compact  — tighter lockup (sidebar, partner)
 * D stacked  — non-horizontal (mobile short header)
 * E mark     — brand seal without wordmark (favicon, loader, export corner)
 */
export function DiscoverLogo({
  variant = "secondary",
  className = "",
  inverted = false,
}: LogoProps) {
  const color = inverted ? "var(--discover-yellow)" : "var(--discover-obsidian)";
  const tagColor = inverted ? "var(--discover-obsidian)" : "var(--discover-storm)";

  if (variant === "mark") {
    return (
      <Image
        src="/brand/logo_2.png"
        alt="DISCOVER"
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
        <div
          className="font-blogh"
          style={{ color, fontSize: "1.35rem", lineHeight: 1.1 }}
        >
          DISCOVER
        </div>
        <div
          className="font-glora-xl"
          style={{
            color: tagColor,
            fontSize: "0.55rem",
            letterSpacing: "0.18em",
            marginTop: "0.45rem",
            textTransform: "uppercase",
          }}
        >
          4 Friends,
          <br />
          By Friends.
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={className} style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
        <span className="font-blogh" style={{ color, fontSize: "1.1rem" }}>
          DISCOVER
        </span>
        <span
          className="font-glora-xl"
          style={{ color: tagColor, fontSize: "0.5rem", letterSpacing: "0.16em" }}
        >
          4 FRIENDS, BY FRIENDS.
        </span>
      </div>
    );
  }

  if (variant === "primary") {
    return (
      <div className={className}>
        <div className="font-blogh" style={{ color, fontSize: "clamp(1.8rem, 5vw, 2.6rem)" }}>
          DISCOVER
        </div>
        <div
          className="font-glora-xl"
          style={{
            color: tagColor,
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            marginTop: "0.65rem",
            textTransform: "uppercase",
          }}
        >
          4 Friends, By Friends.
        </div>
      </div>
    );
  }

  return (
    <span className={`font-blogh ${className}`} style={{ color, fontSize: "1.25rem" }}>
      DISCOVER
    </span>
  );
}
