//app/(user)/layout.tsx

// import TestPanel from "@/components/common/test-panel"; //(only dev)
import AppLayout from "@/components/layout/app-layout";
import LanguageSwitcher from "@/components/ui/language-swticher";
import Providers from "@/providers/antd";
import React, { memo } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <LanguageSwitcher/>
      <AppLayout childrens={children} />
    </Providers>
  );
};

export default memo(Layout);
