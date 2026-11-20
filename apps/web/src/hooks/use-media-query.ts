import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** md de Tailwind (768px). Mobile-first: todo lo que no sea desktop es mobile. */
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
