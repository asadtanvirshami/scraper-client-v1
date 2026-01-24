import { Header } from "antd/es/layout/layout";
import { ProfileDropdown, LogoutButton } from "./header-menu";
import LanguageSwitcher from "@/components/ui/language-swticher";
import NotificationsBell from "@/components/ui/notification-bell";

const AppHeader = () => {
  return (
    <Header className="!h-13">
      <div className="flex justify-end !h-13 !w-full items-center gap-2">
        <LanguageSwitcher />
        <ProfileDropdown />
        <NotificationsBell/>
        <LogoutButton />
      </div>
    </Header>
  );
};

export default AppHeader;
