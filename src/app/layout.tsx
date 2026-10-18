import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/brand/AppShell";
import { copy } from "@/copy";
import { AuthProvider } from "@/lib/auth";
import { FilterProvider } from "@/lib/filters";
import "./tokens.css";

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
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
