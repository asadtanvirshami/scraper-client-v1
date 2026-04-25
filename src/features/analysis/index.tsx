"use client";

import { Typography } from "antd";
import { InstagramOutlined, LinkedinOutlined } from "@ant-design/icons";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import OptionGrid from "./ui/option-grid";
import { ANALYSIS_PLATFORM_OPTIONS } from "./constants";

const { Text, Title } = Typography;

const AnalysisHome = () => {
  const iconMap: Record<string, React.ReactNode> = {
    instagram: <InstagramOutlined style={{ fontSize: 22 }} />,
    linkedin: <LinkedinOutlined style={{ fontSize: 22 }} />,
  };

  return (
    <div className="p-4 lg:p-6">
      <AnalysisBreadcrumbs
        items={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Analysis" },
        ]}
      />

      <div className="mb-4">
        <Title level={4} className="!mb-1">
          Analysis
        </Title>
        <Text type="secondary">
          Select a platform to continue to service-level analysis.
        </Text>
      </div>

      <OptionGrid
        items={ANALYSIS_PLATFORM_OPTIONS.map((platform) => ({
          key: platform.slug,
          icon: iconMap[platform.slug],
          title: platform.title,
          description: platform.description,
          href: `/analysis/${platform.slug}`,
        }))}
      />
    </div>
  );
};

export default AnalysisHome;
