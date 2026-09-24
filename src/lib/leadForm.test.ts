import { describe, expect, it, vi } from "vitest";
import {
  buildLeadPayload,
  handleLeadSubmit,
  validateLeadFields,
  type LeadFields,
} from "./leadForm";
import { ApiError } from "./types";

const FIELDS: LeadFields = {
  name: "  Camila Restrepo  ",
  phone: "+57 301 234 5678",
  birthDate: "1998-05-20",
  email: "  camila.restrepo@example.com ",
};

describe("buildLeadPayload", () => {
  it("maps birthDate to birth_date (snake_case) and trims the strings", () => {
    expect(buildLeadPayload(FIELDS)).toEqual({
      name: "Camila Restrepo",
      phone: "+57 301 234 5678",
      birth_date: "1998-05-20",
      email: "camila.restrepo@example.com",
      source: "captura-web",
    });
  });

  it("never emits a camelCase birthDate key", () => {
    const payload = buildLeadPayload(FIELDS) as Record<string, unknown>;
    expect(payload).not.toHaveProperty("birthDate");
    expect(payload).toHaveProperty("birth_date");
  });
});

describe("validateLeadFields", () => {
  it("returns null for a valid set of fields", () => {
    expect(validateLeadFields(FIELDS)).toBeNull();
  });

  it("flags an invalid email", () => {
    expect(validateLeadFields({ ...FIELDS, email: "not-an-email" })).toBe(
      "Ese correo no se ve válido.",
    );
  });

  it("flags a missing birth date", () => {
    expect(validateLeadFields({ ...FIELDS, birthDate: "" })).toBe(
      "Elegí tu fecha de nacimiento.",
    );
  });
});

describe("handleLeadSubmit", () => {
  function deps(submit: ReturnType<typeof vi.fn>) {
    return {
      submit,
      navigate: vi.fn(),
      setError: vi.fn(),
      setPending: vi.fn(),
    };
  }

  it("prevents the native submit and posts birth_date, then navigates on success", async () => {
    const preventDefault = vi.fn();
    const submit = vi.fn(async () => ({ id: "lead-1", redirect_url: "https://discover-co.com" }));
    const d = deps(submit);

    await handleLeadSubmit({ preventDefault }, FIELDS, d);

    // 1) el GET nativo queda cancelado
    expect(preventDefault).toHaveBeenCalledOnce();
    // 2) el cuerpo enviado usa birth_date (snake_case)
    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({ birth_date: "1998-05-20", source: "captura-web" }),
    );
    expect(submit.mock.calls[0][0]).not.toHaveProperty("birthDate");
    // 3) navega al redirect_url del backend, sin error
    expect(d.navigate).toHaveBeenCalledWith("https://discover-co.com");
    expect(d.setError).not.toHaveBeenCalledWith(expect.stringMatching(/./));
  });

  it("does NOT navigate on a backend error and shows the message inline", async () => {
    const preventDefault = vi.fn();
    const submit = vi.fn(async () => {
      throw new ApiError(422, "value is not a valid email address");
    });
    const d = deps(submit);

    await handleLeadSubmit({ preventDefault }, FIELDS, d);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(d.navigate).not.toHaveBeenCalled();
    expect(d.setError).toHaveBeenCalledWith("value is not a valid email address");
    expect(d.setPending).toHaveBeenLastCalledWith(false);
  });

  it("prevents default, shows a local error and never calls submit when fields are invalid", async () => {
    const preventDefault = vi.fn();
    const submit = vi.fn();
    const d = deps(submit);

    await handleLeadSubmit({ preventDefault }, { ...FIELDS, email: "nope" }, d);

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
    expect(d.navigate).not.toHaveBeenCalled();
    expect(d.setError).toHaveBeenCalledWith("Ese correo no se ve válido.");
  });
});
