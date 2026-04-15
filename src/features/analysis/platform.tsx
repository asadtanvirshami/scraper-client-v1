"use client";

import { Card, Segmented, Typography } from "antd";
import { useMemo, useState } from "react";

import AnalysisBreadcrumbs from "./ui/analysis-breadcrumbs";
import OptionGrid from "./ui/option-grid";
import LeadsScraperCard from "@/features/scraper/ui/scrapper-card";
import {
  ANALYSIS_PLATFORM_MAP,
  ANALYSIS_SERVICE_OPTIONS,
  type AnalysisPlatformSlug,
} from "./constants";

const { Text, Title } = Typography;

type ExtractorMode = "individual" | "bulk";

type AnalysisPlatformPageProps = {
  platform: AnalysisPlatformSlug;
};

const AnalysisPlatformPage = ({ platform }: AnalysisPlatformPageProps) => {
  const platformInfo = ANALYSIS_PLATFORM_MAP[platform];
  const [mode, setMode] = useState<ExtractorMode>("individual");

  const serviceItems = useMemo(
    () =>
      ANALYSIS_SERVICE_OPTIONS.map((service) => ({
        key: service.slug,
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
          { title: "Dashboard", href: "/dashboard" },
          { title: "Analysis", href: "/analysis" },
          { title: platformInfo.title },
        ]}
      />

      <div className="mb-4">
        <Title level={4} className="!mb-1">
          {platformInfo.title}
        </Title>
        <Text type="secondary">
          Choose extractor mode and continue with the same scraping flow used in Leads.
        </Text>
      </div>

      <Card className="mb-4" bodyStyle={{ padding: 16 }}>
        <Segmented
          value={mode}
          onChange={(value) => setMode(value as ExtractorMode)}
          options={[
            { label: "Individual extractor", value: "individual" },
            { label: "Bulk extractor", value: "bulk" },
          ]}
        />
      </Card>

      {mode === "individual" ? (
        <LeadsScraperCard />
      ) : (
        <>
          <div className="mb-4">
            <Title level={5} className="!mb-1">
              Bulk extractor services
            </Title>
            <Text type="secondary">
              Select a service to run bulk extraction for followers or following.
            </Text>
          </div>

          <OptionGrid items={serviceItems} />
        </>
      )}
    </div>
  );
};

export default AnalysisPlatformPage;
