"use client";

import { Avatar, Layout, Menu } from "antd";
import {
  UserCircleIcon,
  ChartBarSquareIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

const { Sider } = Layout;

const items = [
  <UserCircleIcon className="w-5 h-5" />,
  <ChartBarSquareIcon className="w-5 h-5" />,
  <DocumentCheckIcon className="w-5 h-5" />,
  <DocumentCheckIcon className="w-5 h-5" />,
  <DocumentCheckIcon className="w-5 h-5" />,
  <DocumentCheckIcon className="w-5 h-5" />,
  <DocumentCheckIcon className="w-5 h-5" />,
  <DocumentCheckIcon className="w-5 h-5" />,
].map((icon, index) => ({
  key: String(index + 1),
  icon,
  label: `nav ${index + 1}`,
}));

const AppSider = () => {
  return (
    <Sider className="flex flex-col" breakpoint="lg" collapsedWidth="0">
      <div>
        <h1 className="text-2xl p-4 ml-3">Brand Logo</h1>
        <Menu className="!border-r-0" mode="inline" items={items} />
      </div>
    </Sider>
  );
};

export default AppSider;
