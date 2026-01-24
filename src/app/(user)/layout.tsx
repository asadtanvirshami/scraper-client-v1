"use client";
import { DrawerProvider } from "@/components/layout/app-drawer/user-app-drawer";
//app/(user)/layout.tsx

// import TestPanel from "@/components/common/test-panel"; //(only dev)
import AppLayout from "@/components/layout/app-layout";
import Providers from "@/providers/antd";
import React, { memo } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <DrawerProvider>
        <AppLayout childrens={children} />
      </DrawerProvider>
    </Providers>
  );
};

export default memo(Layout);
