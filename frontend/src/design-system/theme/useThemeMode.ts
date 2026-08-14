  import { useCallback, useEffect, useState } from "react";

  export const ThemeMode = {
    System: "system",
    Light: "light",
    Dark: "dark",
  } as const;

  export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

  const STORAGE_KEY = "health-survey.theme";

  const isThemeMode = (value: string | null): value is ThemeMode =>
    value === ThemeMode.System || value === ThemeMode.Light || value === ThemeMode.Dark;

  const readStoredMode = (): ThemeMode => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isThemeMode(stored) ? stored : ThemeMode.System;
    } catch {
      // Private browsing can make localStorage throw on access.
      return ThemeMode.System;
    }
  };

  const prefersDark = (): boolean =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const applyMode = (mode: ThemeMode): void => {
    const dark = mode === ThemeMode.Dark || (mode === ThemeMode.System && prefersDark());
    document.documentElement.classList.toggle("dark", dark);
  };

  /**
   * Light/dark selection.
   *
   * `system` is the default and keeps following the OS while selected — hence
   * the media-query listener, without which a user on "system" would stay light
   * after their machine switched to dark at sunset.
   */
  export function useThemeMode() {
    const [mode, setMode] = useState<ThemeMode>(readStoredMode);

    useEffect(() => {
      applyMode(mode);

      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Persisting is a nicety; the mode still applies for this session.
      }

      if (mode !== ThemeMode.System) return;

      const query = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyMode(ThemeMode.System);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    }, [mode]);

    /** Cycles system → light → dark → system. */
    const cycle = useCallback(() => {
      setMode((current) =>
        current === ThemeMode.System
          ? ThemeMode.Light
          : current === ThemeMode.Light
            ? ThemeMode.Dark
            : ThemeMode.System,
      );
    }, []);

    return { mode, setMode, cycle };
  }
