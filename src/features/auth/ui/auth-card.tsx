"use client";

import React from "react";
import { Typography } from "antd";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import lightLogo from "../../../../public/assets/PNGs/logo.png";
import darkLogo from "../../../../public/assets/PNGs/logo_dark.png";
import LanguageSwitcher from "@/components/ui (generic)/language-swticher";
import { ThemeModeButton } from "@/components/layout/app-header/header-menu";

const { Title, Text } = Typography;

const authStats = [
  { value: "24/7", labelId: "auth.hero.stats.access" },
  { value: "10x", labelId: "auth.hero.stats.outreach" },
];

type Props = {
  children: React.ReactNode;
  subtitle?: string;
  title: string;
};

const AuthCard = ({ children, title, subtitle }: Props) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f5f8] px-4 py-8 text-gray-900 dark:bg-[#0b0b0f] dark:text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.03),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.06),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.12),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:40px_40px] dark:opacity-[0.08] dark:[background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl justify-end gap-3 pb-4">
        <LanguageSwitcher />
        <ThemeModeButton />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-gray-200 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur dark:border-white/8 dark:bg-[#151519]/95 dark:shadow-[0_30px_120px_rgba(0,0,0,0.55)] xl:grid-cols-[1.02fr_0.9fr]">
          <section className="relative hidden min-h-[680px] overflow-hidden border-r border-gray-200 dark:border-white/8 xl:flex xl:flex-col xl:justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.01)),linear-gradient(135deg,rgba(0,0,0,0.01),rgba(0,0,0,0.03))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.08))]" />
            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:36px_36px] dark:opacity-[0.14] dark:[background-image:linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)]" />

            <div className="relative flex items-center px-8 pt-8">
              <Image
                src={lightLogo}
                alt="Logo"
                width={132}
                height={28}
                className="h-auto w-[132px] object-contain dark:hidden"
                priority
              />
              <Image
                src={darkLogo}
                alt="Logo"
                width={132}
                height={28}
                className="hidden h-auto w-[132px] object-contain dark:block"
                priority
              />
            </div>

            <div className="relative px-8 pb-12 pt-6">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#f39ad1]">
                <FormattedMessage id="auth.hero.badge" />
              </p>
              <h1 className="max-w-[420px] text-6xl font-black leading-[0.92] tracking-[-0.05em] text-gray-900 dark:text-white">
                <FormattedMessage id="auth.hero.title" />
              </h1>
              <p className="mt-7 max-w-[380px] text-lg leading-8 text-gray-500 dark:text-white/68">
                <FormattedMessage id="auth.hero.description" />
              </p>

              <div className="mt-12 grid max-w-[360px] grid-cols-2 gap-4">
                {authStats.map((item) => (
                  <div
                    key={item.value}
                    className="rounded-[22px] border border-gray-200 bg-gray-50 px-5 py-5 shadow-[inset_0_1px_0_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <div className="text-4xl font-bold tracking-[-0.04em] text-gray-900 dark:text-white">
                      {item.value}
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-white/60">
                      <FormattedMessage id={item.labelId} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex min-h-[680px] items-center bg-white px-6 py-8 dark:bg-[#151519] sm:px-10 xl:px-12">
            <div className="mx-auto w-full max-w-[420px]">
              <div className="mb-10 flex justify-center xl:mb-12">
                <Image
                  src={lightLogo}
                  alt="Logo"
                  width={128}
                  height={28}
                  className="hidden h-auto w-32 object-contain xl:block xl:dark:hidden"
                  priority
                />
                <Image
                  src={darkLogo}
                  alt="Logo"
                  width={128}
                  height={28}
                  className="hidden h-auto w-32 object-contain xl:dark:block"
                  priority
                />
                <Image
                  src={lightLogo}
                  alt="Logo"
                  width={112}
                  height={28}
                  className="h-auto w-28 object-contain xl:hidden dark:hidden"
                  priority
                />
                <Image
                  src={darkLogo}
                  alt="Logo"
                  width={112}
                  height={28}
                  className="hidden h-auto w-28 object-contain dark:block xl:dark:hidden"
                  priority
                />
              </div>

              <div className="mb-9 text-center xl:text-center">
                <Title
                  level={1}
                  className="!mb-3 !text-[2.65rem] !font-extrabold !leading-[1.02] !tracking-[-0.04em] !text-gray-900 dark:!text-white"
                >
                  <FormattedMessage id={title} />
                </Title>
                {subtitle && (
                  <Text className="mx-auto block max-w-[320px] text-base leading-7 text-gray-500 dark:text-white/52">
                    <FormattedMessage id={subtitle} />
                  </Text>
                )}
              </div>

              <div className="w-full">{children}</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
