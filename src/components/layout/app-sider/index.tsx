"use client";

import { Layout, Menu } from "antd";
import {
  ChartBarSquareIcon,
  MegaphoneIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";

const { Sider } = Layout;

const AppSider = () => {
  const intl = useIntl();

  const items = [
    {
      key: "dashboard",
      icon: <ChartBarSquareIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.dashboard" }),
    },
    {
      key: "campaigns",
      icon: <MegaphoneIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.campaigns" }),
    },
    {
      key: "leads",
      icon: <UserGroupIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.leads" }),
    },
    {
      key: "billing",
      icon: <CreditCardIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.billing" }),
    },
    {
      key: "settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.settings" }),
    },
  ];

  return (
    <Sider breakpoint="lg" collapsedWidth="0">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold">
          {intl.formatMessage({ id: "sidebar.brand" })}
        </h1>
      </div>

      <Menu
        mode="inline"
        className="!border-r-0"
        items={items}
        defaultSelectedKeys={["dashboard"]}
      />
    </Sider>
  );
};

export default AppSider;
