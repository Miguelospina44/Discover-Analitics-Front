// @vitest-environment jsdom
//
// Prueba de cableado a nivel de página (jsdom): monta <CapturaPage/>, llena los
// inputs y envía el formulario. A diferencia de leadForm.test.ts (que prueba la
// función pura), esto atrapa regresiones del wiring de la página: que el submit
// lea los valores del DOM y dispare un POST real a /api/v1/leads con birth_date,
// y luego navegue. Cubre el bug real: valores presentes en el DOM sin pasar por
// el estado de React (autocompletado o escritura antes de hidratar) deben
// enviarse igual y NO perderse en un submit nativo.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import CapturaPage from "./page";

function setDomValue(name: string, value: string) {
  const el = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
  el.value = value;
}

describe("CapturaPage (cableado de la página)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ id: "lead-1", redirect_url: "https://discover-co.com" }), {
          status: 201,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { href: "http://localhost/captura" },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("lee los valores del DOM (aunque React nunca haya visto onChange), hace POST a /api/v1/leads y navega", async () => {
    render(<CapturaPage />);
    const form = document.querySelector("form") as HTMLFormElement;

    // Valores presentes en el DOM sin disparar el onChange de React: replica el
    // autocompletado del navegador o la escritura antes de la hidratación.
    setDomValue("name", "Camila Restrepo");
    setDomValue("phone", "+57 301 234 5678");
    setDomValue("birth_date", "1998-05-20");
    setDomValue("email", "camila@example.com");

    fireEvent.submit(form);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/v1/leads");
    expect(init.method).toBe("POST");

    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      name: "Camila Restrepo",
      phone: "+57 301 234 5678",
      birth_date: "1998-05-20",
      email: "camila@example.com",
      source: "captura-web",
    });
    // Nunca emite la clave camelCase que el backend rechazaría.
    expect(body).not.toHaveProperty("birthDate");

    await waitFor(() => expect(window.location.href).toBe("https://discover-co.com"));
  });

  it("muestra un error de validación y NO hace POST cuando faltan campos", async () => {
    render(<CapturaPage />);
    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe("http://localhost/captura");
  });
});
