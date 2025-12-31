import React from "react";
import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";

const items: MenuProps["items"] = [
  {
    label: (
      <a
        href="https://www.antgroup.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        1st menu item
      </a>
    ),
    key: "0",
  },
  {
    label: (
      <a
        href="https://www.aliyun.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        2nd menu item
      </a>
    ),
    key: "1",
  },
  {
    type: "divider",
  },
  {
    label: "3rd menu item",
    key: "3",
  },
];

const ProfileDropdown: React.FC = () => (
  <Dropdown menu={{ items }} trigger={["click"]}>
    <a onClick={(e) => e.preventDefault()}>
      <Space className="!w-full">
        <Avatar
          className="!mb-1"
          size="large"
          src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
        />
      </Space>
    </a>
  </Dropdown>
);

const LogoutButton: React.FC = () => (
  <Button variant="outlined" size="large" className="!p-3 !bg-transparent !rounded-full">
    <LogoutOutlined />
  </Button>
);

export { LogoutButton, ProfileDropdown };
