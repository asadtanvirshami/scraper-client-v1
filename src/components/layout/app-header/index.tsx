
import { Header } from "antd/es/layout/layout";
import { ProfileDropdown, LogoutButton } from "./header-menu";

const AppHeader = () => {
  return (
    <Header className="!h-13">
      <div className="flex justify-end !h-13 !w-full items-center gap-2">
        <ProfileDropdown />
        <LogoutButton />
      </div>
    </Header>
  );
};

export default AppHeader;
