"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import AppDrawer from "./index";

type DrawerState = {
  open: boolean;
  title?: React.ReactNode;
  width?: number;
  content?: React.ReactNode;
};

type DrawerContextType = {
  openDrawer: (payload: { title?: React.ReactNode; width?: number; content: React.ReactNode }) => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextType | null>(null);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DrawerState>({
    open: false,
    title: undefined,
    width: 520,
    content: undefined,
  });

  const openDrawer: DrawerContextType["openDrawer"] = ({ title, width, content }) => {
    setState({ open: true, title, width: width ?? 520, content });
  };

  const closeDrawer = () => {
    setState((s) => ({ ...s, open: false, content: undefined }));
  };

  const value = useMemo(() => ({ openDrawer, closeDrawer }), []);

  return (
    <DrawerContext.Provider value={value}>
      {children}

      {/* Global drawer mounted once */}
      <AppDrawer
        open={state.open}
        title={state.title}
        width={state.width}
        onClose={closeDrawer}
      >
        {state.content}
      </AppDrawer>
    </DrawerContext.Provider>
  );
};

export const useAppDrawer = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("useAppDrawer must be used inside <DrawerProvider />");
  }
  return ctx;
};
