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

type SubmittableEvent = { preventDefault: () => void };

export type LeadSubmitDeps = {
  submit?: typeof defaultSubmitLead;
  navigate: (url: string) => void;
  setError: (message: string | null) => void;
  setPending: (pending: boolean) => void;
};

// Orquesta el envío del formulario:
// 1) preventDefault SIEMPRE primero, para que el navegador no haga el GET nativo.
// 2) validación local; si falla, muestra error y no navega.
// 3) POST /api/v1/leads con birth_date; en éxito navega a redirect_url.
// 4) en error, muestra el error inline y NO navega.
export async function handleLeadSubmit(
  event: SubmittableEvent,
  fields: LeadFields,
  deps: LeadSubmitDeps,
): Promise<void> {
  event.preventDefault();
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
