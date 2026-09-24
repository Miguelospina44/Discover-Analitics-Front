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
import {
  EMPTY_LEAD_FIELDS,
  handleLeadSubmit,
  type LeadFields,
} from "@/lib/leadForm";

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

export default function CapturaPage() {
  const [fields, setFields] = useState<LeadFields>(EMPTY_LEAD_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: keyof LeadFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    // preventDefault vive dentro de handleLeadSubmit y se ejecuta PRIMERO, de
    // modo que el navegador nunca dispara el submit GET nativo. En éxito navega
    // a redirect_url; en error muestra el mensaje inline sin navegar.
    await handleLeadSubmit(e, fields, {
      submit: submitLead,
      navigate: (url) => {
        window.location.href = url;
      },
      setError,
      setPending,
    });
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
        method="post"
        noValidate
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
          name="birth_date"
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
