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
    // Rose-red accent with grayish-black neutrals
    const ROSE = "#E11D48";
    const ROSE_HOVER = "#BE123C";
    const ROSE_ACTIVE = "#9F1239";

    const dark = {
      // Accent (rose-red)
      accent: ROSE,
      accentHover: ROSE_HOVER,
      accentActive: ROSE_ACTIVE,
      accentSoft: "rgba(225,29,72,0.18)",

      // Neutrals (black/white)
      bgBase: "#0b0b0d", // grayish black
      bgContainer: "rgba(22, 22, 24, 0.74)",
      bgElevated: "rgba(26, 26, 30, 0.90)",

      textBase: "rgba(255,255,255,0.92)",
      textSecondary: "rgba(255,255,255,0.62)",

      // IMPORTANT: keep borders neutral (no blue tint)
      border: "rgba(255,255,255,0.12)",
      borderStrong: "rgba(255,255,255,0.18)",

      shadow2: "0 10px 30px rgba(0,0,0,0.45)",

      appBg:
        "radial-gradient(1100px 760px at 14% 8%, rgba(225,29,72,0.24), transparent 58%), radial-gradient(900px 640px at 86% 16%, rgba(127,29,29,0.18), transparent 60%), linear-gradient(180deg, #070708 0%, #141418 100%)",

      siderBg: "rgba(20, 20, 24, 0.64)",
      selectedBg: "rgba(225,29,72,0.22)",
      hoverBg: "rgba(255,255,255,0.06)",
    };

    const light = {
      // Accent (rose-red)
      accent: ROSE,
      accentHover: ROSE_HOVER,
      accentActive: ROSE_ACTIVE,
      accentSoft: "rgba(225,29,72,0.12)",

      // Neutrals (white/black)
      bgBase: "#FFFFFF",
      bgContainer: "rgba(255,255,255,0.88)",
      bgElevated: "rgba(255,255,255,0.96)",

      textBase: "rgba(0,0,0,0.92)",
      textSecondary: "rgba(0,0,0,0.60)",

      // IMPORTANT: keep borders neutral (no blue tint)
      border: "rgba(0,0,0,0.10)",
      borderStrong: "rgba(0,0,0,0.16)",

      shadow2: "0 10px 30px rgba(0,0,0,0.10)",

      appBg:
        "radial-gradient(1100px 760px at 14% 8%, rgba(225,29,72,0.12), transparent 58%), radial-gradient(900px 640px at 86% 16%, rgba(127,29,29,0.08), transparent 60%), linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)",

      siderBg: "rgba(0,0,0,0.03)",
      selectedBg: "rgba(225,29,72,0.14)",
      hoverBg: "rgba(0,0,0,0.04)",
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
            // keep primary clean; subtle depth only
            primaryShadow: isDark
              ? "0 10px 24px rgba(0,0,0,0.55)"
              : "0 10px 24px rgba(0,0,0,0.12)",
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
