"use client";

import React from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useIntl } from "react-intl";

import SettingsPreferences from "../form/general";
import ProfileForm from "../form/profile";
import PasswordSecruityForm from "../form/password-security";
import SupportTabContent from "../form/support";

const SettingTabs: React.FC = () => {
  const intl = useIntl();

  const items: TabsProps["items"] = [
    {
      key: "general",
      label: intl.formatMessage({
        id: "settings.tabs.general",
        defaultMessage: "General",
      }),
      children: <SettingsPreferences />,
    },
    {
      key: "profile",
      label: intl.formatMessage({
        id: "settings.tabs.profile",
        defaultMessage: "Profile",
      }),
      children: <ProfileForm />,
    },
    {
      key: "password_security",
      label: intl.formatMessage({
        id: "settings.tabs.password_security",
        defaultMessage: "Password & Security",
      }),
      children: <PasswordSecruityForm />,
    },
    {
      key: "support",
      label: intl.formatMessage({
        id: "settings.tabs.support",
        defaultMessage: "Support & Feedback",
      }),
      children: <SupportTabContent />,
    },
  ];

  return <Tabs defaultActiveKey="general" items={items} />;
};

export default SettingTabs;
