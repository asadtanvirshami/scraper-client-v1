"use client";

import { ConfigProvider, theme } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import esES from "antd/locale/es_ES";

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setIsDark(true);
    else if (savedTheme === "light") setIsDark(false);
    else setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    if (isDark === null) return;
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const onThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<"dark" | "light" | undefined>;
      const nextTheme = customEvent.detail;

      if (nextTheme === "dark") setIsDark(true);
      else if (nextTheme === "light") setIsDark(false);
      else {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") setIsDark(true);
        else if (savedTheme === "light") setIsDark(false);
      }
    };

    window.addEventListener("app-theme-change", onThemeChange as EventListener);
    return () => {
      window.removeEventListener("app-theme-change", onThemeChange as EventListener);
    };
  }, []);

  const palette = useMemo(() => {
    // Soft light-violet accent with Supabase-style neutrals
    const PURPLE = "#8b5cf6";       // violet-500 — light, soft purple
    const PURPLE_HOVER = "#7c3aed"; // violet-600
    const PURPLE_ACTIVE = "#6d28d9"; // violet-700

    const dark = {
      // Accent (purple)
      accent: PURPLE,
      accentHover: PURPLE_HOVER,
      accentActive: PURPLE_ACTIVE,
      accentSoft: "rgba(139,92,246,0.14)",

      // Supabase-style dark neutrals
      bgBase: "#0e0e10",
      bgContainer: "#18181b",
      bgElevated: "#1f1f23",

      textBase: "rgba(255,255,255,0.90)",
      textSecondary: "rgba(255,255,255,0.50)",

      border: "rgba(255,255,255,0.07)",
      borderStrong: "rgba(255,255,255,0.12)",

      shadow2: "0 1px 4px rgba(0,0,0,0.40)",

      // Clean flat dark background
      appBg: "#0e0e10",

      siderBg: "#111113",
      selectedBg: "rgba(139,92,246,0.12)",
      hoverBg: "rgba(255,255,255,0.04)",
    };

    const light = {
      // Accent (soft violet)
      accent: PURPLE,
      accentHover: PURPLE_HOVER,
      accentActive: PURPLE_ACTIVE,
      accentSoft: "rgba(139,92,246,0.09)",

      // Supabase-style light neutrals
      bgBase: "#ffffff",
      bgContainer: "#ffffff",
      bgElevated: "#ffffff",

      textBase: "rgba(9,9,11,0.90)",
      textSecondary: "rgba(9,9,11,0.52)",

      border: "rgba(9,9,11,0.07)",
      borderStrong: "rgba(9,9,11,0.12)",

      shadow2: "0 1px 4px rgba(0,0,0,0.06)",

      // Clean light background (Supabase off-white)
      appBg: "#f9f9fb",

      siderBg: "#ffffff",
      selectedBg: "rgba(139,92,246,0.07)",
      hoverBg: "rgba(9,9,11,0.03)",
    };

    return isDark ? dark : light;
  }, [isDark]);

  if (isDark === null) return null;

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
          // ✅ Rose-red is the brand/accent
          colorPrimary: palette.accent,
          colorPrimaryHover: palette.accentHover,
          colorPrimaryActive: palette.accentActive,

          // ✅ Stop AntD’s “blue glow” outlines
          controlOutline: "transparent",
          controlOutlineWidth: 0,

          // ✅ Links use accent color (not white/black)
          colorLink: palette.accent,
          colorLinkHover: palette.accentHover,

          borderRadius: 14,

          // Info follows accent
          colorInfo: palette.accent,
          colorInfoHover: palette.accentHover,
          colorInfoActive: palette.accentActive,

          // Backgrounds
          colorBgBase: palette.bgBase,
          colorBgContainer: palette.bgContainer,
          colorBgElevated: palette.bgElevated,

          // ✅ Neutral borders everywhere (prevents bluish borders)
          colorBorder: palette.border,
          colorBorderSecondary: palette.border,
          colorSplit: palette.border,

          // Text
          colorTextBase: palette.textBase,
          colorText: palette.textBase,
          colorTextSecondary: palette.textSecondary,

          // Shadows
          boxShadowSecondary: palette.shadow2,
        },

        components: {
          Layout: {
            headerBg: "transparent",
            bodyBg: "transparent",
            footerBg: "transparent",
            siderBg: palette.siderBg,
            triggerBg: "transparent",
          },

          Card: {
            headerBg: "transparent",
            colorBgContainer: palette.bgContainer,
          },

          Button: {
            primaryShadow: isDark
              ? "0 2px 12px rgba(139,92,246,0.35)"
              : "0 2px 10px rgba(139,92,246,0.22)",
          },

          Menu: {
            itemBg: "transparent",
            subMenuItemBg: "transparent",
            itemSelectedBg: palette.selectedBg,
            itemSelectedColor: palette.textBase,
            itemHoverBg: palette.hoverBg,
          },

          Input: {
            // ✅ Neutral borders, blue only on focus
            activeBorderColor: palette.accent,
            hoverBorderColor: palette.borderStrong,
            activeShadow: `0 0 0 3px ${palette.accentSoft}`,
          },

          Select: {
            // same idea as Input
            optionSelectedBg: palette.selectedBg,
            optionActiveBg: palette.hoverBg,
          },

          Tabs: {
            inkBarColor: palette.accent,
            itemSelectedColor: palette.accent,
            itemHoverColor: palette.accentHover,
          },

          Typography: {
            colorTextHeading: palette.textBase,
            colorTextDescription: palette.textSecondary,
            colorText: palette.textBase,
            colorTextDisabled: isDark
              ? "rgba(255,255,255,0.35)"
              : "rgba(0,0,0,0.35)",
          },

          Divider: {
            colorSplit: palette.border,
          },
        },
      }}
    >
      <div style={{ minHeight: "100vh", background: palette.appBg }}>
        {children}
      </div>
    </ConfigProvider>
  );
}
