"use client";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import InstagramAnalyzer from "@/features/leads/ui/instagram-analyzer";
import {
  ANALYSIS_PLATFORM_MAP,
  ANALYSIS_SERVICE_MAP,
  type AnalysisPlatformSlug,
  type AnalysisServiceSlug,
} from "./constants";

type AnalysisServicePageProps = {
  platform: AnalysisPlatformSlug;
  service: AnalysisServiceSlug;
};

const AnalysisServicePage = ({ platform, service }: AnalysisServicePageProps) => {
  const platformInfo = ANALYSIS_PLATFORM_MAP[platform];
  const serviceInfo = ANALYSIS_SERVICE_MAP[service];

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

      <InstagramAnalyzer
        compact
        platform={platform}
        defaultType={service}
        lockType
        showProfileAvatar
      />
    </div>
  );
};

export default AnalysisServicePage;
