import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __TABLEROS_SEED,
  __TABLEROS_STORAGE_KEY,
  deleteTablero,
  listTableros,
  saveTablero,
  type TableroScope,
} from "./tableros";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

const scope: TableroScope = {
  venue: "Club Central",
  period: { start: "2026-09-01", end: "2026-09-07" },
  analysisType: "Ventas por noche",
};

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createMemoryStorage() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listTableros", () => {
  it("seeds the store with example tableros on first read", () => {
    const tableros = listTableros();
    expect(tableros).toHaveLength(__TABLEROS_SEED.length);
    const raw = window.localStorage.getItem(__TABLEROS_STORAGE_KEY);
    expect(raw).not.toBeNull();
  });

  it("returns tableros sorted newest first", () => {
    const tableros = listTableros();
    const timestamps = tableros.map((t) => t.createdAt);
    const sorted = [...timestamps].sort((a, b) => b.localeCompare(a));
    expect(timestamps).toEqual(sorted);
  });
});

describe("saveTablero", () => {
  it("prepends a new tablero and persists it", () => {
    listTableros();
    const before = window.localStorage.getItem(__TABLEROS_STORAGE_KEY);
    const next = saveTablero({ name: "Nuevo", description: "Prueba", scope });
    expect(next[0].name).toBe("Nuevo");
    expect(next).toHaveLength(__TABLEROS_SEED.length + 1);
    expect(window.localStorage.getItem(__TABLEROS_STORAGE_KEY)).not.toBe(before);
  });

  it("trims whitespace and captures the provided scope", () => {
    listTableros();
    const [created] = saveTablero({
      name: "  Con espacios  ",
      description: "  desc  ",
      scope,
    });
    expect(created.name).toBe("Con espacios");
    expect(created.description).toBe("desc");
    expect(created.scope).toEqual(scope);
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
  });
});

describe("deleteTablero", () => {
  it("removes a tablero by id", () => {
    const seeded = listTableros();
    const target = seeded[0];
    const next = deleteTablero(target.id);
    expect(next.find((t) => t.id === target.id)).toBeUndefined();
    expect(next).toHaveLength(seeded.length - 1);
  });
});
