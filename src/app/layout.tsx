import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./tokens.css";

export const metadata: Metadata = {
  title: "Discover Analytics",
  description: "Estudios de público y consultoría para establecimientos Discover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
