"use client";

import { ConfigProvider, theme } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import enUS from "antd/locale/en_US";
import esES from "antd/locale/es_ES";
import { useLanguage } from "@/hooks/language/use-language";

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function Providers({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
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
    const PURPLE = "#8b5cf6";
    const PURPLE_HOVER = "#7c3aed";
    const PURPLE_ACTIVE = "#6d28d9";

    const dark = {
      accent: PURPLE,
      accentHover: PURPLE_HOVER,
      accentActive: PURPLE_ACTIVE,
      accentSoft: "rgba(139,92,246,0.14)",
      bgBase: "#0e0e10",
      bgContainer: "#18181b",
      bgElevated: "#1f1f23",
      textBase: "rgba(255,255,255,0.90)",
      textSecondary: "rgba(255,255,255,0.54)",
      border: "rgba(255,255,255,0.08)",
      borderStrong: "rgba(255,255,255,0.14)",
      shadow2: "0 1px 4px rgba(0,0,0,0.40)",
      appBg: "#0e0e10",
      siderBg: "#111113",
      selectedBg: "rgba(139,92,246,0.12)",
      hoverBg: "rgba(255,255,255,0.04)",
    };

    const light = {
      accent: PURPLE,
      accentHover: PURPLE_HOVER,
      accentActive: PURPLE_ACTIVE,
      accentSoft: "rgba(139,92,246,0.09)",
      bgBase: "#ffffff",
      bgContainer: "#ffffff",
      bgElevated: "#ffffff",
      textBase: "rgba(9,9,11,0.90)",
      textSecondary: "rgba(9,9,11,0.56)",
      border: "rgba(9,9,11,0.08)",
      borderStrong: "rgba(9,9,11,0.14)",
      shadow2: "0 1px 4px rgba(0,0,0,0.06)",
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
      locale={language === "es" ? esES : enUS}
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: palette.accent,
          colorPrimaryHover: palette.accentHover,
          colorPrimaryActive: palette.accentActive,
          controlOutline: "transparent",
          controlOutlineWidth: 0,
          colorLink: palette.accent,
          colorLinkHover: palette.accentHover,
          borderRadius: 8,
          colorInfo: palette.accent,
          colorInfoHover: palette.accentHover,
          colorInfoActive: palette.accentActive,
          colorBgBase: palette.bgBase,
          colorBgContainer: palette.bgContainer,
          colorBgElevated: palette.bgElevated,
          colorBorder: palette.border,
          colorBorderSecondary: palette.border,
          colorSplit: palette.border,
          colorTextBase: palette.textBase,
          colorText: palette.textBase,
          colorTextSecondary: palette.textSecondary,
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
            activeBorderColor: palette.accent,
            hoverBorderColor: palette.borderStrong,
            activeShadow: `0 0 0 3px ${palette.accentSoft}`,
          },
          Select: {
            optionSelectedBg: palette.selectedBg,
            optionActiveBg: palette.hoverBg,
          },
          Table: {
            headerBg: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
            headerColor: palette.textBase,
            rowHoverBg: palette.hoverBg,
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
          Modal: {
            contentBg: palette.bgContainer,
            headerBg: palette.bgContainer,
            titleColor: palette.textBase,
          },
          Drawer: {
            colorBgElevated: palette.bgElevated,
          },
          Pagination: {
            itemActiveBg: palette.selectedBg,
          },
          Descriptions: {
            labelBg: isDark ? "rgba(255,255,255,0.03)" : "#fafafa",
          },
          Segmented: {
            trackBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(9,9,11,0.04)",
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
