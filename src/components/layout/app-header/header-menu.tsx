import React from "react";
import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import { useUserInfo } from "@/helpers/use-user";

const ProfileDropdown: React.FC = () => {
  const { user } = useUserInfo();
  console.log(user);

  const items: MenuProps["items"] = [
    {
      className: "!bg-transparent hover:!bg-transparent",
      label: <p>{user?.first_name + " " + user?.last_name}</p>,
      key: "0",
    },
    {
      className: "!bg-transparent hover:!bg-transparent",
      label: <p className="muted">{user?.email}</p>,
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
  return (
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
};

const LogoutButton: React.FC = () => (
  <Button
    variant="outlined"
    size="large"
    className="!p-3 !bg-transparent !rounded-full"
  >
    <LogoutOutlined />
  </Button>
);

export { LogoutButton, ProfileDropdown };
