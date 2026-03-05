import React, { useEffect, useState } from "react";
import { LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Space, Spin, Typography } from "antd";
import { useUserInfo } from "@/helpers/use-user";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/user/user-slice";
import { clearAuthCookies } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { persistor } from "@/redux/store";

const ThemeModeButton: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDark(savedTheme === "dark");
  }, []);

  const handleToggleTheme = () => {
    const nextIsDark = !isDark;
    const nextTheme = nextIsDark ? "dark" : "light";

    setIsDark(nextIsDark);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextIsDark);
    window.dispatchEvent(new CustomEvent("app-theme-change", { detail: nextTheme }));
  };

  return (
    <Button
      type="default"
      size="large"
      className="!p-3 !bg-transparent !rounded-full"
      onClick={handleToggleTheme}
      aria-label="Toggle theme"
    >
      {isDark ? <SunOutlined /> : <MoonOutlined />}
    </Button>
  );
};

const ProfileDropdown: React.FC = () => {
  const { user } = useUserInfo();
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    setAvatarLoading(Boolean(user?.avatar_url));
  }, [user?.avatar_url]);

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
              src={
                user?.avatar_url ? (
                  <img
                    src={user.avatar_url as string}
                    alt="avatar"
                    onLoad={() => setAvatarLoading(false)}
                    onError={() => setAvatarLoading(false)}
                  />
                ) : undefined
              }
            />
        </Space>
      </a>
    </Dropdown>
  );
};

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1️⃣ Clear Redux state
      dispatch(logoutUser());

      // 2️⃣ Purge persisted Redux state
      await persistor.purge();

      // 3️⃣ Clear auth cookies
      clearAuthCookies();

      // 4️⃣ Redirect to sign-in
      router.replace("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      type="default"
      size="large"
      className="!p-3 !bg-transparent !rounded-full"
      onClick={handleLogout}
      aria-label="Logout"
    >
      <LogoutOutlined />
    </Button>
  );
};

export { LogoutButton, ProfileDropdown, ThemeModeButton };
