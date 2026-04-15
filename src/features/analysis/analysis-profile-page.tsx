"use client";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import AnalysisProfileExtractor from "./profile-extractor";
import {
  ANALYSIS_PLATFORM_MAP,
  type AnalysisPlatformSlug,
} from "./constants";

type AnalysisProfilePageProps = {
  platform: AnalysisPlatformSlug;
};

const AnalysisProfilePage = ({ platform }: AnalysisProfilePageProps) => {
  const platformInfo = ANALYSIS_PLATFORM_MAP[platform];

  return (
    <div className="p-4 lg:p-6">
      <AnalysisBreadcrumbs
        items={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Analysis", href: "/analysis" },
          { title: platformInfo.title, href: `/analysis/${platform}` },
          { title: "Profile" },
        ]}
      />

      <AnalysisProfileExtractor platform="instagram" compact />
    </div>
  );
};

export default AnalysisProfilePage;
