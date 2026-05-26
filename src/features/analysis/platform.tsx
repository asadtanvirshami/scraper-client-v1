"use client";

import { Typography } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
  InstagramOutlined,
  LinkedinOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import OptionGrid from "./ui/option-grid";
import AnalysisProfileExtractor from "./profile-extractor";
import {
  FormattedMessage,
  useIntl,
} from "react-intl";
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
  const intl = useIntl();
  const platformInfo = ANALYSIS_PLATFORM_MAP[platform];
  const isLinkedIn = platform === "linkedin";
  const isInstagram = platform === "instagram";
  const PlatformIcon = isLinkedIn ? LinkedinOutlined : InstagramOutlined;

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
          {
            title: intl.formatMessage({
              id: "sidebar.dashboard",
              defaultMessage: "Dashboard",
            }),
            href: "/dashboard",
          },
          {
            title: intl.formatMessage({
              id: "sidebar.analysis",
              defaultMessage: "Analysis",
            }),
            href: "/analysis",
          },
          { title: intl.formatMessage(platformInfo.title) },
        ]}
      />

      <div className="mb-4">
        <Title level={4} className="!mb-1">
          <PlatformIcon style={{ marginRight: 8 }} />
          {intl.formatMessage(platformInfo.title)}
        </Title>
        {!isLinkedIn ? (
          <Text type="secondary">
            <FormattedMessage
              id="analysis.platform.instagram.subtitle"
              defaultMessage="Choose from individual or bulk extraction services and continue with the same scraping flow used in Leads."
            />
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
              <FormattedMessage
                id="analysis.platform.instagram.individual_section"
                defaultMessage="Individual Profile Extraction"
              />
            </Title>
            <OptionGrid
              items={[
                {
                  key: "profile",
                  icon: <UserOutlined />,
                  title: intl.formatMessage({
                    id: "analysis.platform.instagram.single_card.title",
                    defaultMessage: "Individual Profile Extraction",
                  }),
                  description: intl.formatMessage({
                    id: "analysis.platform.instagram.single_card.description",
                    defaultMessage:
                      "Extract profile details for a single Instagram account and review results.",
                  }),
                  href: "/analysis/instagram/profile",
                },
              ]}
            />
          </div>

          <div className="mb-4">
            <Title level={5} className="!mb-3">
              <FormattedMessage
                id="analysis.platform.instagram.bulk_section"
                defaultMessage="Bulk extractor services"
              />
            </Title>
            <Text type="secondary">
              <FormattedMessage
                id="analysis.platform.instagram.bulk_subtitle"
                defaultMessage="Select a service to run bulk extraction for followers or following."
              />
            </Text>
          </div>

          <OptionGrid
            items={serviceItems.map((service) => ({
              ...service,
              title: intl.formatMessage(service.title as any),
              description: intl.formatMessage(service.description as any),
            }))}
          />
        </>
      ) : null}
    </div>
  );
};

export default AnalysisPlatformPage;
