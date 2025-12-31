"use client";
import React from "react";
import { Layout } from "antd";
import AppSider from "../app-sider";
import AppContent from "../app-content";
import AppHeader from "../app-header";
import { usePathname } from "next/navigation";

const AppLayout = ({ childrens }: { childrens: React.ReactNode }) => {
  const path = usePathname();
  const isAuthPath = path.startsWith("/auth");
  const isPlansRoute = path.startsWith("/plans");

  if (isAuthPath || isPlansRoute) {
    return (
      <section className="flex justify-center h-screen items-center">
        {childrens}
      </section>
    );
  }
  return (
    <Layout hasSider>
      <AppSider />
      <Layout>
        <AppHeader />
        <AppContent children={childrens} />
      </Layout>
    </Layout>
  );
};

export default AppLayout;
