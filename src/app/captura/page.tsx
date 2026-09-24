"use client";

// Ruta PÚBLICA de captura de leads. Renderiza sin token: un visitante entrega
// sus datos de contacto (PII) y, al enviarlos, el navegador se redirige a
// Discover con la URL que devuelve el backend.
//
// NOTA DE PRIVACIDAD (producción): este flujo recoge datos personales
// (nombre, teléfono, fecha de nacimiento, correo). Antes de usarlo con datos
// reales hace falta consentimiento explícito, retención y manejo de habeas
// data. Aquí es solo una prueba de flujo con datos ficticios.

import { FormEvent, useState } from "react";
import { DiscoverLogo } from "@/brand/DiscoverLogo";
import { submitLead } from "@/lib/api";
import { ApiError } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: 999,
  border: "1px solid var(--discover-line-strong)",
  background: "var(--discover-paper)",
  color: "var(--discover-ink)",
  fontFamily: "var(--font-ui)",
  fontWeight: 400,
  marginBottom: "1rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--discover-storm)",
  marginBottom: 6,
};

type Fields = {
  name: string;
  phone: string;
  birthDate: string;
  email: string;
};

const EMPTY: Fields = { name: "", phone: "", birthDate: "", email: "" };

export default function CapturaPage() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function localValidation(): string | null {
    if (fields.name.trim().length < 2) return "Contanos tu nombre.";
    if (fields.phone.trim().length < 5) return "Dejanos un teléfono válido.";
    if (!fields.birthDate) return "Elegí tu fecha de nacimiento.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      return "Ese correo no se ve válido.";
    }
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const localError = localValidation();
    if (localError) {
      setError(localError);
      return;
    }
    setPending(true);
    try {
      const { redirect_url } = await submitLead({
        name: fields.name.trim(),
        phone: fields.phone.trim(),
        birth_date: fields.birthDate,
        email: fields.email.trim(),
        source: "captura-web",
      });
      // Redirección real del navegador a Discover.
      window.location.href = redirect_url;
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("No pudimos conectar con el API. Intentá de nuevo en un toque.");
      setPending(false);
    }
  }

  return (
    <main
      className="pattern-stamp"
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.25rem",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="surface-card"
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2rem 1.5rem",
          boxShadow: "var(--glow-violet)",
          borderTop: "3px solid var(--discover-yellow)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <DiscoverLogo variant="primary" />
        </div>
        <h1
          className="font-glora-xl"
          style={{
            color: "var(--discover-obsidian)",
            fontSize: "1.5rem",
            fontWeight: 200,
            margin: "0 0 0.5rem",
          }}
        >
          Entrá al parche
        </h1>
        <p
          className="font-glora-l"
          style={{
            color: "var(--discover-ink-soft)",
            marginBottom: "1.5rem",
            fontStyle: "italic",
          }}
        >
          Dejanos tus datos y te llevamos a Discover.
        </p>

        <label className="font-glora-xl" style={labelStyle}>
          Nombre
        </label>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={fields.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Tu nombre"
          required
          style={inputStyle}
        />

        <label className="font-glora-xl" style={labelStyle}>
          Teléfono
        </label>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          value={fields.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+57 300 000 0000"
          required
          style={inputStyle}
        />

        <label className="font-glora-xl" style={labelStyle}>
          Fecha de nacimiento
        </label>
        <input
          type="date"
          name="birthDate"
          autoComplete="bday"
          value={fields.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
          required
          style={inputStyle}
        />

        <label className="font-glora-xl" style={labelStyle}>
          Correo
        </label>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={fields.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="tucorreo@ejemplo.com"
          required
          style={{ ...inputStyle, marginBottom: "1.35rem" }}
        />

        {error ? (
          <p
            className="font-glora"
            style={{ color: "var(--discover-tomato)", marginBottom: "1rem", fontSize: "0.9rem" }}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn-discover" style={{ width: "100%" }} disabled={pending}>
          {pending ? "Entrando…" : "Entrar a Discover"}
        </button>
      </form>
    </main>
  );
}
