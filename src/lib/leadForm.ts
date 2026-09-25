// Lógica pura del formulario público de captura, extraída de la página para
// poder probarla sin DOM. Garantiza el mapeo a snake_case que espera el backend
// (birth_date) y que el submit NO haga una navegación GET nativa.

import { submitLead as defaultSubmitLead } from "./api";
import { ApiError, type LeadCreate } from "./types";

export type LeadFields = {
  name: string;
  phone: string;
  birthDate: string;
  email: string;
};

export const EMPTY_LEAD_FIELDS: LeadFields = {
  name: "",
  phone: "",
  birthDate: "",
  email: "",
};

// Construye el cuerpo JSON exactamente como lo espera LeadCreate en el backend:
// name, phone, birth_date (snake_case), email, source?.
export function buildLeadPayload(fields: LeadFields): LeadCreate {
  return {
    name: fields.name.trim(),
    phone: fields.phone.trim(),
    birth_date: fields.birthDate,
    email: fields.email.trim(),
    source: "captura-web",
  };
}

export function validateLeadFields(fields: LeadFields): string | null {
  if (fields.name.trim().length < 2) return "Contanos tu nombre.";
  if (fields.phone.trim().length < 5) return "Dejanos un teléfono válido.";
  if (!fields.birthDate) return "Elegí tu fecha de nacimiento.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    return "Ese correo no se ve válido.";
  }
  return null;
}

// El navegador es la ÚNICA fuente de verdad de lo que el visitante ve/escribe.
// Leemos los valores directamente del <form> (FormData) en el submit, usando las
// claves de los atributos name= (birth_date en snake_case). Así el lead se envía
// aunque el estado de React nunca haya capturado los keystrokes: escritura antes
// de la hidratación, autocompletado del navegador o gestores de contraseñas que
// setean input.value sin disparar el onChange sintético de React. `fallback` solo
// se usa cuando no hay <form> (p. ej. en pruebas unitarias del orquestador).
export function readLeadFieldsFromForm(
  form: HTMLFormElement,
  fallback: LeadFields = EMPTY_LEAD_FIELDS,
): LeadFields {
  const data = new FormData(form);
  const read = (key: string, fb: string): string => {
    const value = data.get(key);
    return typeof value === "string" ? value : fb;
  };
  return {
    name: read("name", fallback.name),
    phone: read("phone", fallback.phone),
    birthDate: read("birth_date", fallback.birthDate),
    email: read("email", fallback.email),
  };
}

type SubmittableEvent = {
  preventDefault: () => void;
  currentTarget?: unknown;
};

// Extrae el <form> del evento de submit sin romper en entornos sin DOM (Node):
// solo devuelve el elemento cuando HTMLFormElement existe y coincide.
function formFromEvent(event: SubmittableEvent): HTMLFormElement | null {
  const target = event.currentTarget;
  if (typeof HTMLFormElement !== "undefined" && target instanceof HTMLFormElement) {
    return target;
  }
  return null;
}

export type LeadSubmitDeps = {
  submit?: typeof defaultSubmitLead;
  navigate: (url: string) => void;
  setError: (message: string | null) => void;
  setPending: (pending: boolean) => void;
};

// Orquesta el envío del formulario:
// 1) preventDefault SIEMPRE primero, para que el navegador no haga el submit nativo.
// 2) lee los campos del DOM (FormData); el `fallback` de React solo aplica sin form.
// 3) validación local; si falla, muestra error y no navega.
// 4) POST /api/v1/leads con birth_date; en éxito navega a redirect_url.
// 5) en error, muestra el error inline y NO navega.
export async function handleLeadSubmit(
  event: SubmittableEvent,
  fallback: LeadFields,
  deps: LeadSubmitDeps,
): Promise<void> {
  event.preventDefault();
  const form = formFromEvent(event);
  const fields = form ? readLeadFieldsFromForm(form, fallback) : fallback;
  const submit = deps.submit ?? defaultSubmitLead;
  deps.setError(null);

  const localError = validateLeadFields(fields);
  if (localError) {
    deps.setError(localError);
    return;
  }

  deps.setPending(true);
  try {
    const { redirect_url } = await submit(buildLeadPayload(fields));
    deps.navigate(redirect_url);
  } catch (err) {
    if (err instanceof ApiError) deps.setError(err.message);
    else deps.setError("No pudimos conectar con el API. Intentá de nuevo en un toque.");
    deps.setPending(false);
  }
}
