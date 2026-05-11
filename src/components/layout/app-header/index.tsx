import { Header } from "antd/es/layout/layout";
import { ProfileDropdown, LogoutButton, ThemeModeButton } from "./header-menu";
import LanguageSwitcher from "@/components/ui (generic)/language-swticher";
import NotificationsBell from "@/components/ui (generic)/notification-bell";
import CreditsBadge from "@/components/ui (generic)/credits-badge";
import { Tooltip } from "antd";
import { RectangleGroupIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import type { NavMode } from "@/components/layout/navigation/app-navigation";

const LABELS: Record<string, string> = {
  a: "Admin",
  u: "Workspace",
  dashboard: "Dashboard",
  analysis: "Analysis",
  campaigns: "Campaigns",
  create: "Create",
  edit: "Edit",
  leads: "Leads",
  folders: "Folders",
  notifications: "Notifications",
  billings: "Billing",
  settings: "Settings",
  users: "Users",
  bugs: "Bugs",
  feedback: "Feedback",
  "email-templates": "Email Templates",
};

const toTitle = (segment: string) =>
  LABELS[segment] ??
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .slice(0, 28);

type AppHeaderProps = {
  navMode: NavMode;
  onNavModeChange: (mode: NavMode) => void;
};

const AppHeader = ({ navMode, onNavModeChange }: AppHeaderProps) => {
  const pathname = usePathname();
  const crumbs = (pathname ?? "/")
    .split("/")
    .filter(Boolean)
    .filter((segment) => !/^[a-f0-9]{16,}$/i.test(segment))
    .slice(0, 4);

  return (
    <Header className="app-header">
      <div className="app-header__left">
        <div className="app-breadcrumb" aria-label="Breadcrumb">
          <span className="app-breadcrumb__root">App</span>
          {crumbs.map((crumb) => (
            <span className="app-breadcrumb__item" key={crumb}>
              {toTitle(crumb)}
            </span>
          ))}
        </div>
      </div>

      <div className="app-header__actions">
        <CreditsBadge />
        <LanguageSwitcher />
        <Tooltip
          title={navMode === "sidebar" ? "Use bottom deck" : "Use sidebar"}
          placement="bottom"
        >
          <button
            type="button"
            className="app-header__icon-button"
            aria-label="Toggle navigation mode"
            onClick={() => onNavModeChange(navMode === "sidebar" ? "deck" : "sidebar")}
          >
            {navMode === "sidebar" ? (
              <RectangleGroupIcon className="h-[17px] w-[17px]" />
            ) : (
              <ViewColumnsIcon className="h-[17px] w-[17px]" />
            )}
          </button>
        </Tooltip>
        <ThemeModeButton />
        <NotificationsBell />
        <ProfileDropdown />
        <LogoutButton />
      </div>
    </Header>
  );
};

export default AppHeader;
