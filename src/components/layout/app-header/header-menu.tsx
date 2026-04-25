import React, { useEffect, useState } from "react";
import {
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Tooltip, Typography, theme } from "antd";
import { useUserInfo } from "@/helpers/use-user";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/user/user-slice";
import { clearAuthCookies } from "@/lib/cookies";
import { useRouter } from "next/navigation";
import { persistor } from "@/redux/store";

const { Text } = Typography;

/** Shared style for icon-only header buttons */
const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 17,
  transition: "background 0.15s",
  flexShrink: 0,
};

const ThemeModeButton: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const { token } = theme.useToken();

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
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"} placement="bottom">
      <button
        style={{ ...iconBtnStyle, color: token.colorTextSecondary }}
        onClick={handleToggleTheme}
        aria-label="Toggle theme"
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = token.colorFillTertiary; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {isDark ? <SunOutlined style={{ fontSize: 17 }} /> : <MoonOutlined style={{ fontSize: 17 }} />}
      </button>
    </Tooltip>
  );
};

const ProfileDropdown: React.FC = () => {
  const { user } = useUserInfo();
  const { token } = theme.useToken();
  const router = useRouter();

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Account";

  const items: MenuProps["items"] = [
    {
      key: "info",
      label: (
        <div style={{ padding: "4px 0", minWidth: 180 }}>
          <Text strong style={{ display: "block", fontSize: 14 }}>{fullName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
        </div>
      ),
    },
    { type: "divider" },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
  ];

  return (
    <Tooltip title="Account" placement="bottom">
      <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
        <button
          style={{
            ...iconBtnStyle,
            padding: 0,
            border: `2px solid ${token.colorBorderSecondary}`,
            borderRadius: "50%",
            width: 34,
            height: 34,
            overflow: "hidden",
          }}
          aria-label="Profile"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = token.colorPrimary; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = token.colorBorderSecondary; }}
        >
          <Avatar
            size={30}
            src={user?.avatar_url ? <img src={user.avatar_url as string} alt="avatar" /> : undefined}
            icon={<UserOutlined />}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        </button>
      </Dropdown>
    </Tooltip>
  );
};

const LogoutButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = theme.useToken();

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      await persistor.purge();
      clearAuthCookies();
      router.replace("/auth/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Tooltip title="Sign out" placement="bottom">
      <button
        style={{ ...iconBtnStyle, color: token.colorTextSecondary }}
        onClick={handleLogout}
        aria-label="Logout"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
          (e.currentTarget as HTMLElement).style.color = "#ef4444";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = token.colorTextSecondary;
        }}
      >
        <LogoutOutlined style={{ fontSize: 17 }} />
      </button>
    </Tooltip>
  );
};

export { LogoutButton, ProfileDropdown, ThemeModeButton };
