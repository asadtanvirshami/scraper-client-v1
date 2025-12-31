"use client";

import { ConfigProvider, theme } from "antd";
import React, { useEffect, useState } from "react";

const { defaultAlgorithm, darkAlgorithm } = theme;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const yellowPrimary = "#fadb14"; // AntD "gold" vibe
  const yellowHover = "#ffe58f";
  const yellowActive = "#d4b106";

  // Read theme from localStorage OR system
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setIsDark(true);
    } else if (savedTheme === "light") {
      setIsDark(false);
    } else {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(media.matches);
    }
  }, []);

  // Persist theme + (optional) sync Tailwind
  useEffect(() => {
    if (isDark === null) return;

    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Optional: for Tailwind dark mode
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  if (isDark === null) return null; // prevents flicker

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,

        // Global tokens (affect EVERYTHING)
        token: {
          colorPrimary: yellowPrimary,
          colorPrimaryHover: yellowHover,
          colorPrimaryActive: yellowActive,

          // Links / focus / borders / etc often follow primary
          colorLink: yellowPrimary,
          colorLinkHover: yellowHover,

          // Border radius / spacing if you want a “premium” feel
          borderRadius: 14,

          // Dark/light surfaces tuned to make yellow pop nicely
          colorBgBase: isDark ? "#0b0f14" : "#fffdf2",
          colorBgContainer: isDark
            ? "rgba(17, 24, 39, 0.72)"
            : "rgba(255, 255, 255, 0.78)",
          colorBgElevated: isDark
            ? "rgba(17, 24, 39, 0.88)"
            : "rgba(255, 255, 255, 0.92)",

          colorTextBase: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)",
          colorText: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)",
          colorTextSecondary: isDark
            ? "rgba(255,255,255,0.65)"
            : "rgba(0,0,0,0.6)",
          colorBorder: isDark
            ? "rgba(255, 232, 120, 0.18)"
            : "rgba(212, 177, 6, 0.22)",

          // subtle “brand glow”
          boxShadowSecondary: isDark
            ? "0 10px 35px rgba(250, 219, 20, 0.08)"
            : "0 10px 35px rgba(212, 177, 6, 0.12)",
        },

        // ✅ Component-level tokens (override special cases)
        components: {
          Layout: {
            headerBg: "transparent",
            bodyBg: "transparent",
            footerBg: "transparent",
            siderBg: isDark
              ? "rgba(17, 24, 39, 0.55)"
              : "rgba(207, 207, 161, 0.55)",
            triggerBg: "transparent",
          },

          Form: {
            labelColor: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.78)",
            labelFontSize: 16,
            labelRequiredMarkColor: "#fadb14",

            // spacing + clarity
            itemMarginBottom: 18,
          },

          Typography: {
            colorTextHeading: isDark
              ? "rgba(255,255,255,0.92)"
              : "rgba(0,0,0,0.92)",
            colorTextDescription: isDark
              ? "rgba(255,255,255,0.72)"
              : "rgba(0,0,0,0.65)",
            colorText: isDark ? "rgba(255,255,255,0.88)" : "rgba(0,0,0,0.88)",
            colorTextDisabled: isDark
              ? "rgba(255,255,255,0.35)"
              : "rgba(0,0,0,0.3)",
          },

          Button: {
            colorPrimary: yellowPrimary,
            colorPrimaryHover: yellowHover,
            colorPrimaryActive: yellowActive,
            primaryShadow: isDark
              ? "0 10px 24px rgba(250, 219, 20, 0.16)"
              : "0 10px 24px rgba(212, 177, 6, 0.20)",
          },

          Menu: {
            itemBg: "transparent",
            subMenuItemBg: "transparent",
            itemSelectedBg: isDark
              ? "rgba(250, 219, 20, 0.14)"
              : "rgba(250, 219, 20, 0.22)",
            itemSelectedColor: isDark ? "#fff" : "rgba(0,0,0,0.88)",
            itemHoverBg: isDark
              ? "rgba(250, 219, 20, 0.10)"
              : "rgba(250, 219, 20, 0.16)",
          },

          Card: {
            headerBg: "transparent",
            colorBgContainer: isDark
              ? "rgba(17, 24, 39, 0.62)"
              : "rgba(255,255,255,0.72)",
          },

          Input: {
            activeBorderColor: yellowPrimary,
            hoverBorderColor: yellowHover,
          },

          Select: {
            optionSelectedBg: isDark
              ? "rgba(250, 219, 20, 0.14)"
              : "rgba(250, 219, 20, 0.18)",
          },

          Tabs: {
            inkBarColor: yellowPrimary,
            itemSelectedColor: yellowPrimary,
            itemHoverColor: yellowHover,
          },
        },
      }}
    >
      {/* ✅ AntD App gives proper message/notification context styling too */}
      <section>
        {/* ✅ Global gradient background wrapper */}
        <div
          style={{
            minHeight: "100vh",
            background: isDark
              ? "radial-gradient(1200px 800px at 20% 10%, rgba(250,219,20,0.18), transparent 55%), radial-gradient(1000px 700px at 80% 20%, rgba(250,219,20,0.10), transparent 55%), linear-gradient(180deg, #070a0f 0%, #0b0f14 100%)"
              : "radial-gradient(1200px 800px at 20% 10%, rgba(250,219,20,0.22), transparent 55%), radial-gradient(1000px 700px at 80% 20%, rgba(250,219,20,0.14), transparent 55%), linear-gradient(180deg, #fff7cc 0%, #ffffff 55%, #fffdf2 100%)",
          }}
        >
          {children}
        </div>
      </section>
    </ConfigProvider>
  );
}
