"use client";

import React from "react";
import Image from "next/image";
import { Button, Dropdown, MenuProps, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useLanguage } from "@/hooks/language/use-language";

// import us_flag from "../../../public/assets/flags/us.png";
// import es_flag from "../../../public/assets/flags/sp.png";

const languages = [
//   { code: "en", label: "English", flag: us_flag },
//   { code: "es", label: "Español", flag: es_flag }
  { code: "en", label: "English", },
  { code: "es", label: "Español", }
] as const;

type LangCode = (typeof languages)[number]["code"];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find((l) => l.code === language) ?? languages[0];

  const items: MenuProps["items"] = languages.map((lang) => ({
    key: lang.code,
    label: (
      <div className="flex items-center gap-2">
        {/* <Image src={lang.flag} alt={lang.label} width={20} height={20} /> */}
        <span className={language === lang.code ? "font-semibold" : ""}>
          {lang.label}
        </span>
      </div>
    )
  }));

  const onClick: MenuProps["onClick"] = ({ key }) => {
    setLanguage(key as LangCode);
  };

  return (
    <Dropdown menu={{ items, onClick }} placement="bottomRight" trigger={["click"]}>
      <Button>
        <Space>
          {/* <Image src={currentLang.flag} alt={currentLang.label} width={20} height={20} /> */}
          <span>{currentLang.label}</span>
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
