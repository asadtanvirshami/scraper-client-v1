"use client";

import React from "react";
import { useCampaign } from "../../hooks";
import { useUserInfo } from "@/helpers/use-user";
import CampaignForm from "../campaign-form";
import { Spin } from "antd";
import Spinner from "@/components/ui (generic)/spinner";

const EditCampaign = ({ campaignId }: { campaignId: string }) => {
  const { id: userId } = useUserInfo();
  const { data, isLoading } = useCampaign({
    id: campaignId,
    user_id: userId ?? "",
  });

  if (isLoading) {
    return <Spinner size="large" />;
  }

  const campaign = data?.data?.data ?? data?.data ?? data;

  return (
    <CampaignForm mode="edit" campaignId={campaignId} initialData={campaign} />
  );
};

export default EditCampaign;
