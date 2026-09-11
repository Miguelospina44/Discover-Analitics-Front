import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/brand/AppShell";
import { AuthProvider } from "@/lib/auth";
import { FilterProvider } from "@/lib/filters";
import "./tokens.css";

export const metadata: Metadata = {
  title: "DISCOVER Analytics",
  description: "La brújula de tu público. Estudios y métricas de panas a panas.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <FilterProvider>
            <AppShell>{children}</AppShell>
          </FilterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
