"use client";
import { DrawerProvider } from "@/components/layout/app-drawer/user-app-drawer";
//app/(user)/layout.tsx
import { GoogleOAuthProvider } from "@react-oauth/google";

// import TestPanel from "@/components/common/test-panel"; //(only dev)
import AppLayout from "@/components/layout/app-layout";
import Providers from "@/providers/antd";
import AutoFeedbackModal from "@/features/feedbacks/ui/auto-feedback-modal";
import React, { memo } from "react";
import "@/components/layout/app-layout/app-shell.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
    >
      <Providers>
        <DrawerProvider>
          <AppLayout childrens={children} />
          <AutoFeedbackModal />
        </DrawerProvider>
      </Providers>
    </GoogleOAuthProvider>
  );
};

export default memo(Layout);
