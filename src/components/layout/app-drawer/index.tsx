"use client";

import React from "react";
import { Drawer } from "antd";

export type AppDrawerProps = {
  open: boolean;
  title?: React.ReactNode;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;

  destroyOnClose?: boolean;
  maskClosable?: boolean;
};

const AppDrawer: React.FC<AppDrawerProps> = ({
  open,
  title,
  width = 520,
  onClose,
  children,
  destroyOnClose = true,
  maskClosable = true,
}) => {
  return (
    <Drawer
      open={open}
      title={title}
      size={width}
      onClose={onClose}
      destroyOnHidden={destroyOnClose}
      maskClosable={maskClosable}
    >
      {children}
    </Drawer>
  );
};

export default AppDrawer;
