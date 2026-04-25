import { Header } from "antd/es/layout/layout";
import { ProfileDropdown, LogoutButton, ThemeModeButton } from "./header-menu";
import LanguageSwitcher from "@/components/ui (generic)/language-swticher";
import NotificationsBell from "@/components/ui (generic)/notification-bell";
import CreditsBadge from "@/components/ui (generic)/credits-badge";

const AppHeader = () => {
  return (
    <Header className="!h-13">
      <div className="flex justify-end !h-13 !w-full items-center gap-1">
        <CreditsBadge />
        <LanguageSwitcher />
        <ThemeModeButton />
        <NotificationsBell/>
        <ProfileDropdown />
        <LogoutButton />
      </div>
    </Header>
  );
};

export default AppHeader;
