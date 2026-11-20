/**
 * Zustand = estado SOLO de interfaz (tema, menús, preferencias visuales).
 * Los datos del servidor NUNCA van acá: van por TanStack Query.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

type UiState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    { name: "ui-preferences" },
  ),
);

export function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
