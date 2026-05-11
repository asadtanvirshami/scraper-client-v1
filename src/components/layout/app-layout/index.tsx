"use client";
import React from "react";
import { Layout } from "antd";
import AppSider from "../app-sider";
import AppContent from "../app-content";
import AppHeader from "../app-header";
import { usePathname } from "next/navigation";
import SubscriptionInitializer from "./subscription-initializer";
import AppBottomDeck from "../app-bottom-deck";
import { useNavModePreference } from "@/components/layout/navigation/use-nav-mode-preference";

const AppLayout = ({ childrens }: { childrens: React.ReactNode }) => {
  const path = usePathname();
  const [navMode, setNavMode] = useNavModePreference("sidebar");
  const isAuthPath = path.startsWith("/auth");
  const isPlansRoute = path.startsWith("/plans");
  const isOnboardingPath = path.startsWith("/onboarding");

  if (isAuthPath || isPlansRoute || isOnboardingPath) {
    return <section className="min-h-screen w-full">{childrens}</section>;
  }

  return (
    <Layout
      hasSider={navMode === "sidebar"}
      className="app-shell"
      data-nav-mode={navMode}
    >
      <SubscriptionInitializer />
      {navMode === "sidebar" ? <AppSider /> : null}
      <Layout className="app-shell__main">
        <AppHeader navMode={navMode} onNavModeChange={setNavMode} />
        <AppContent navMode={navMode}>{childrens}</AppContent>
      </Layout>
      {navMode === "deck" ? <AppBottomDeck /> : null}
    </Layout>
  );
};

export default AppLayout;
