import { notFound } from "next/navigation";

import AnalysisServicePage from "@/features/analysis/service";
import {
  isValidAnalysisPlatform,
  isValidAnalysisService,
  type AnalysisPlatformSlug,
  type AnalysisServiceSlug,
} from "@/features/analysis/constants";

type PageProps = {
  params: Promise<{ platform: string; service: string }>;
};

export default async function Page({ params }: PageProps) {
  const { platform, service } = await params;

  if (!isValidAnalysisPlatform(platform) || !isValidAnalysisService(service)) {
    notFound();
  }

  return (
    <AnalysisServicePage
      platform={platform as AnalysisPlatformSlug}
      service={service as AnalysisServiceSlug}
    />
  );
}
