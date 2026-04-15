import { notFound } from "next/navigation";

import AnalysisPlatformPage from "@/features/analysis/platform";
import {
  isValidAnalysisPlatform,
  type AnalysisPlatformSlug,
} from "@/features/analysis/constants";

type PageProps = {
  params: Promise<{ platform: string }>;
};

export default async function Page({ params }: PageProps) {
  const { platform } = await params;

  if (!isValidAnalysisPlatform(platform)) {
    notFound();
  }

  return <AnalysisPlatformPage platform={platform as AnalysisPlatformSlug} />;
}
