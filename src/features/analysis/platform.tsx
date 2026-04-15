"use client";

import { Typography } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import OptionGrid from "./ui/option-grid";
import AnalysisProfileExtractor from "./profile-extractor";
import {
  ANALYSIS_PLATFORM_MAP,
  ANALYSIS_SERVICE_OPTIONS,
  type AnalysisPlatformSlug,
} from "./constants";

const { Text, Title } = Typography;

type AnalysisPlatformPageProps = {
  platform: AnalysisPlatformSlug;
};

const AnalysisPlatformPage = ({ platform }: AnalysisPlatformPageProps) => {
  const platformInfo = ANALYSIS_PLATFORM_MAP[platform];
  const isLinkedIn = platform === "linkedin";
  const isInstagram = platform === "instagram";

  const serviceItems = useMemo(
    () =>
      ANALYSIS_SERVICE_OPTIONS.map((service) => ({
        key: service.slug,
        icon: service.slug === "followers" ? <TeamOutlined /> : <UserAddOutlined />,
        title: service.title,
        description: service.description,
        href: `/analysis/${platform}/${service.slug}`,
      })),
    [platform],
  );

  return (
    <div className="p-4 lg:p-6">
      <AnalysisBreadcrumbs
        items={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Analysis", href: "/analysis" },
          { title: platformInfo.title },
        ]}
      />

      <div className="mb-4">
        <Title level={4} className="!mb-1">
          {platformInfo.title}
        </Title>
        {!isLinkedIn ? (
          <Text type="secondary">
            Choose from individual or bulk extraction services and continue with the same scraping flow used in Leads.
          </Text>
        ) : null}
      </div>

      {isLinkedIn ? (
        <AnalysisProfileExtractor platform="linkedin" compact />
      ) : null}

      {isInstagram ? (
        <>
          <div className="mb-6">
            <Title level={5} className="!mb-3">
              Individual Profile Extraction
            </Title>
            <OptionGrid
              items={[
                {
                  key: "profile",
                  icon: <UserOutlined />,
                  title: "Individual Profile Extraction",
                  description:
                    "Extract profile details for a single Instagram account and review results.",
                  href: "/analysis/instagram/profile",
                },
              ]}
            />
          </div>

          <div className="mb-4">
            <Title level={5} className="!mb-3">
              Bulk extractor services
            </Title>
            <Text type="secondary">
              Select a service to run bulk extraction for followers or following.
            </Text>
          </div>

          <OptionGrid items={serviceItems} />
        </>
      ) : null}
    </div>
  );
};

export default AnalysisPlatformPage;
