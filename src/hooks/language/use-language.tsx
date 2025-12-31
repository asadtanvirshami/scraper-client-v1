"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import en from "../../../public/locales/en.json";
import es from "../../../public/locales/es.json";

type SupportedLanguage = "en" | "es";

const flagMap: Record<SupportedLanguage, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
};

type MessagePrimitive = string | number | boolean | null;

interface NestedMessages {
  [key: string]:
    | MessagePrimitive
    | NestedMessages
    | Array<MessagePrimitive | NestedMessages>;
}

const flattenMessages = (
  nestedMessages: NestedMessages,
  prefix = ""
): Record<string, string> => {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      // ✅ Cast non-string primitives to string
      messages[prefixedKey] = String(value);
    } else if (Array.isArray(value)) {
      // ✅ Flatten arrays: key.0, key.1, ...
      value.forEach((item, index) => {
        const arrayKey = `${prefixedKey}.${index}`;
        if (
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
        ) {
          messages[arrayKey] = String(item);
        } else if (item && typeof item === "object") {
          Object.assign(
            messages,
            flattenMessages(item as NestedMessages, arrayKey)
          );
        }
      });
    } else if (value && typeof value === "object") {
      // ✅ Nested object – recurse
      Object.assign(
        messages,
        flattenMessages(value as NestedMessages, prefixedKey)
      );
    }

    return messages;
  }, {} as Record<string, string>);
};

// ✅ Apply flattening to both languages
const messages = {
  en: flattenMessages(en as NestedMessages),
  es: flattenMessages(es as NestedMessages),
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  flag: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang") as SupportedLanguage;
    if (storedLang && messages[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    localStorage.setItem("lang", lang);
    setLanguageState(lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    flag: flagMap[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      <IntlProvider locale={language} messages={messages[language]}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
