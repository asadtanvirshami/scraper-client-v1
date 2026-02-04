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

  const palette = useMemo(() => {
    // Pick ONE blue accent and use it everywhere for consistency
    const BLUE = "#3B82F6"; // tailwind blue-500 (clean, modern)
    const BLUE_HOVER = "#2563EB"; // blue-600
    const BLUE_ACTIVE = "#1D4ED8"; // blue-700

    const dark = {
      // Accent (blue)
      accent: BLUE,
      accentHover: BLUE_HOVER,
      accentActive: BLUE_ACTIVE,
      accentSoft: "rgba(59,130,246,0.16)",

      // Neutrals (black/white)
      bgBase: "#09090B", // near-black
      bgContainer: "rgba(24, 24, 27, 0.72)",
      bgElevated: "rgba(24, 24, 27, 0.90)",

      textBase: "rgba(255,255,255,0.92)",
      textSecondary: "rgba(255,255,255,0.62)",

      // IMPORTANT: keep borders neutral (no blue tint)
      border: "rgba(255,255,255,0.12)",
      borderStrong: "rgba(255,255,255,0.18)",

      shadow2: "0 10px 30px rgba(0,0,0,0.45)",

      appBg:
        "radial-gradient(1200px 800px at 20% 10%, rgba(59,130,246,0.10), transparent 60%), radial-gradient(900px 600px at 80% 20%, rgba(255,255,255,0.03), transparent 60%), linear-gradient(180deg, #060607 0%, #09090b 100%)",

      siderBg: "rgba(24, 24, 27, 0.60)",
      selectedBg: "rgba(59,130,246,0.18)", // subtle blue selection
      hoverBg: "rgba(255,255,255,0.06)",
    };

    const light = {
      // Accent (blue)
      accent: BLUE,
      accentHover: BLUE_HOVER,
      accentActive: BLUE_ACTIVE,
      accentSoft: "rgba(59,130,246,0.12)",

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
        "radial-gradient(1200px 800px at 20% 10%, rgba(59,130,246,0.10), transparent 60%), radial-gradient(900px 600px at 80% 20%, rgba(0,0,0,0.02), transparent 60%), linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",

      siderBg: "rgba(0,0,0,0.03)",
      selectedBg: "rgba(59,130,246,0.14)",
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
          // ✅ Blue is the brand/accent
          colorPrimary: palette.accent,
          colorPrimaryHover: palette.accentHover,
          colorPrimaryActive: palette.accentActive,

          // ✅ Stop AntD’s “blue glow” outlines
          controlOutline: "transparent",
          controlOutlineWidth: 0,

          // ✅ Links use accent blue (not white/black)
          colorLink: palette.accent,
          colorLinkHover: palette.accentHover,

          borderRadius: 14,

          // Info should also be blue accent
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
