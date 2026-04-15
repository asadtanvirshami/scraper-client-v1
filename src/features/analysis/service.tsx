"use client";

import { Card, Typography } from "antd";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import InstagramAnalyzer from "@/features/leads/ui/instagram-analyzer";
import {
  ANALYSIS_PLATFORM_MAP,
  ANALYSIS_SERVICE_MAP,
  type AnalysisPlatformSlug,
  type AnalysisServiceSlug,
} from "./constants";

const { Title, Text } = Typography;

type AnalysisServicePageProps = {
  platform: AnalysisPlatformSlug;
  service: AnalysisServiceSlug;
};

const AnalysisServicePage = ({ platform, service }: AnalysisServicePageProps) => {
  const platformInfo = ANALYSIS_PLATFORM_MAP[platform];
  const serviceInfo = ANALYSIS_SERVICE_MAP[service];
  const isLinkedIn = platform === "linkedin";

  return (
    <div className="p-4 lg:p-6">
      <AnalysisBreadcrumbs
        items={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Analysis", href: "/analysis" },
          { title: platformInfo.title, href: `/analysis/${platform}` },
          { title: serviceInfo.shortTitle },
        ]}
      />

      {isLinkedIn ? (
        <Card bodyStyle={{ padding: 24 }}>
          <div className="space-y-2">
            <Title level={5} className="!mb-0">
              LinkedIn does not support this analysis service.
            </Title>
            <Text type="secondary">
              Followers and following extraction are available for Instagram only.
            </Text>
          </div>
        </Card>
      ) : (
        <InstagramAnalyzer
          compact
          platform={platform}
          defaultType={service}
          lockType
          showProfileAvatar
        />
      )}
    </div>
  );
};

export default AnalysisServicePage;
