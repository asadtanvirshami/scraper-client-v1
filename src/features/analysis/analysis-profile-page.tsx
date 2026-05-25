"use client";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import AnalysisProfileExtractor from "./profile-extractor";
import { useIntl } from "react-intl";
import {
  ANALYSIS_PLATFORM_MAP,
  type AnalysisPlatformSlug,
} from "./constants";

type AnalysisProfilePageProps = {
  platform: AnalysisPlatformSlug;
};

const AnalysisProfilePage = ({ platform }: AnalysisProfilePageProps) => {
  const intl = useIntl();
  const platformInfo = ANALYSIS_PLATFORM_MAP[platform];

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
          {
            title: intl.formatMessage(platformInfo.title),
            href: `/analysis/${platform}`,
          },
          {
            title: intl.formatMessage({
              id: "analysis.profile.label",
              defaultMessage: "Profile",
            }),
          },
        ]}
      />

      <AnalysisProfileExtractor platform={platform} compact />
    </div>
  );
};

export default AnalysisProfilePage;
