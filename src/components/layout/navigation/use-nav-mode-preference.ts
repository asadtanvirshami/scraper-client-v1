"use client";

import { useEffect, useState } from "react";
import type { NavMode } from "./app-navigation";

const STORAGE_KEY = "app-nav-mode";
const CHANGE_EVENT = "app-nav-mode-change";

const isNavMode = (value: string | null): value is NavMode =>
  value === "sidebar" || value === "deck";

export function useNavModePreference(defaultMode: NavMode = "sidebar") {
  const [navMode, setNavModeState] = useState<NavMode>(defaultMode);

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (isNavMode(savedMode)) setNavModeState(savedMode);

    const onModeChange = (event: Event) => {
      const nextMode = (event as CustomEvent<NavMode>).detail;
      if (isNavMode(nextMode)) setNavModeState(nextMode);
    };

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && isNavMode(event.newValue)) {
        setNavModeState(event.newValue);
      }
    };

    window.addEventListener(CHANGE_EVENT, onModeChange as EventListener);
    window.addEventListener("storage", onStorageChange);

    return () => {
      window.removeEventListener(CHANGE_EVENT, onModeChange as EventListener);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  const setNavMode = (mode: NavMode) => {
    setNavModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: mode }));
  };

  return [navMode, setNavMode] as const;
}
