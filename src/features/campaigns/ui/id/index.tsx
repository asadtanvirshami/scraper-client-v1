"use client";

import React from "react";
import CampaignInsights from "../campaign-insights";
import CampaignInfo from "../campaign-info";
import CampaignDetails from "../campaign-details";
import { Empty, Space, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useCampaign } from "../../hooks";
import { useUserInfo } from "@/helpers/use-user";
import Spinner from "@/components/ui (generic)/spinner";
import { useIntl } from "react-intl";
import { useRouter } from "next/navigation";

const ViewLayout = ({ id }: { id?: any }) => {
  const { id: userId } = useUserInfo();
  const { data, isLoading } = useCampaign({ id, user_id: userId ?? "" });
  const { formatMessage } = useIntl();
  const router = useRouter();

  const t = (key: string) => formatMessage({ id: key });

  if (isLoading) {
    return <Spinner size="large" />;
  }
  console.log(data);
  
  if (!data?.data) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description={t("campaigns.view.empty")} />
      </div>
    );
  }

  return (
    <div
      style={{ padding: "24px 24px 48px", maxWidth: 1200, margin: "0 auto" }}
    >
      {/* Back Button */}
      <Space style={{ marginBottom: 20 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/campaigns")}
          size="large"
        >
          {t("commons.cancel")}
        </Button>
      </Space>

      <CampaignInfo campaign={data?.data} />
      <div style={{ height: 24 }} />
      <CampaignInsights campaign={data?.data} />
      <div style={{ height: 24 }} />
      <CampaignDetails campaign={data?.data} />
    </div>
  );
};

export default ViewLayout;
