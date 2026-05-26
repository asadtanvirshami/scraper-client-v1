import { Header } from "antd/es/layout/layout";
import { ProfileDropdown, LogoutButton, ThemeModeButton } from "./header-menu";
import LanguageSwitcher from "@/components/ui (generic)/language-swticher";
import NotificationsBell from "@/components/ui (generic)/notification-bell";
import CreditsBadge from "@/components/ui (generic)/credits-badge";
import { Tooltip } from "antd";
import { RectangleGroupIcon, ViewColumnsIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import type { NavMode } from "@/components/layout/navigation/app-navigation";
import { useIntl } from "react-intl";

const LABEL_IDS: Record<string, string> = {
  a: "sidebar.role.admin",
  u: "sidebar.role.user",
  dashboard: "sidebar.dashboard",
  analysis: "sidebar.analysis",
  campaigns: "sidebar.campaigns",
  create: "header.breadcrumbs.create",
  edit: "header.breadcrumbs.edit",
  leads: "sidebar.leads",
  folders: "sidebar.folders",
  notifications: "sidebar.notifications",
  billings: "sidebar.billing",
  settings: "sidebar.settings",
  users: "admin.users.title",
  bugs: "admin.bugs.title",
  feedback: "support.feedback.title",
  "email-templates": "header.breadcrumbs.email_templates",
};

type AppHeaderProps = {
  navMode: NavMode;
  onNavModeChange: (mode: NavMode) => void;
};

const AppHeader = ({ navMode, onNavModeChange }: AppHeaderProps) => {
  const intl = useIntl();
  const pathname = usePathname();
  const toTitle = (segment: string) =>
    LABEL_IDS[segment]
      ? intl.formatMessage({ id: LABEL_IDS[segment] })
      : segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
          .slice(0, 28);
  const crumbs = (pathname ?? "/")
    .split("/")
    .filter(Boolean)
    .filter((segment) => !/^[a-f0-9]{16,}$/i.test(segment))
    .slice(0, 4);

  return (
    <Header className="app-header">
      <div className="app-header__left">
        <div className="app-breadcrumb" aria-label="Breadcrumb">
          <span className="app-breadcrumb__root">
            {intl.formatMessage({ id: "header.breadcrumbs.app" })}
          </span>
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
          title={intl.formatMessage({
            id:
              navMode === "sidebar"
                ? "header.navigation.use_bottom_deck"
                : "header.navigation.use_sidebar",
          })}
          placement="bottom"
        >
          <button
            type="button"
            className="app-header__icon-button"
            aria-label={intl.formatMessage({
              id: "header.navigation.toggle_mode",
            })}
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
