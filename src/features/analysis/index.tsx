"use client";

import { Typography } from "antd";
import { InstagramOutlined, LinkedinOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import OptionGrid from "./ui/option-grid";
import { ANALYSIS_PLATFORM_OPTIONS } from "./constants";

const { Text, Title } = Typography;

const AnalysisHome = () => {
  const intl = useIntl();
  const iconMap: Record<string, React.ReactNode> = {
    instagram: <InstagramOutlined style={{ fontSize: 22 }} />,
    linkedin: <LinkedinOutlined style={{ fontSize: 22 }} />,
  };

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
          },
        ]}
      />

      <div className="mb-4">
        <Title level={4} className="!mb-1">
          {intl.formatMessage({
            id: "analysis.home.title",
            defaultMessage: "Analysis",
          })}
        </Title>
        <Text type="secondary">
          {intl.formatMessage({
            id: "analysis.home.subtitle",
            defaultMessage:
              "Select a platform to continue to service-level analysis.",
          })}
        </Text>
      </div>

      <OptionGrid
        items={ANALYSIS_PLATFORM_OPTIONS.map((platform) => ({
          key: platform.slug,
          icon: iconMap[platform.slug],
          title: intl.formatMessage(platform.title),
          description: intl.formatMessage(platform.description),
          href: `/analysis/${platform.slug}`,
        }))}
      />
    </div>
  );
};

export default AnalysisHome;
