"use client";

import React from "react";
import CampaignInsights from "../campaign-insights";
import CampaignInfo from "../campaign-info";
import CampaignDetails from "../campaign-details";
import { Empty, Space } from "antd";
import { useCampaign } from "../../hooks";
import { useUserInfo } from "@/helpers/use-user";
import Spinner from "@/components/ui (generic)/spinner";
import { useIntl } from "react-intl";

const ViewLayout = ({ id }: { id?: any }) => {
  const { id: userId } = useUserInfo();
  const { data, isLoading } = useCampaign({ id, user_id: userId ?? "" });
  const { formatMessage } = useIntl();

  const t = (key: string) => formatMessage({ id: key });

  if (isLoading) {
    return <Spinner size="large" />;
  }

  if (!data?.data) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description={t("campaigns.view.empty")} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <CampaignInfo campaign={data?.data} />
      <Space orientation="vertical" className="!h-5" />
      <CampaignInsights campaign={data?.data} />
      <Space orientation="vertical" className="!h-5" />
      <CampaignDetails campaign={data?.data} />
    </div>
  );
};

export default ViewLayout;
