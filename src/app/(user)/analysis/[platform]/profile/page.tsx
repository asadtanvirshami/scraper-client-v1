import { notFound } from "next/navigation";

import AnalysisProfilePage from "@/features/analysis/analysis-profile-page";

type PageProps = {
  params: Promise<{ platform: string }>;
};

export default async function Page({ params }: PageProps) {
  const { platform } = await params;

  if (platform !== "instagram") {
    notFound();
  }

  return <AnalysisProfilePage platform="instagram" />;
}
