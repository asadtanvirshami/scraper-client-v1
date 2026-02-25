import { useUserInfo } from "@/helpers/use-user";
import { useCampaigns } from "../hooks";
import { useState } from "react";
import { Card, Empty, Spin, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CampaignCard from "./campaign-card";
import { useIntl } from "react-intl";

const CampaignsDashboard = () => {
  const { id } = useUserInfo();
  const router = useRouter();
  const { formatMessage } = useIntl();

  const t = (key: string) => formatMessage({ id: key });

  const [query] = useState({
    page: 1,
    limit: 10,
    user_id: id ?? "",
    search: "",
  });

  const { data, isLoading, isError } = useCampaigns(query);

  if (isLoading) return <Spin />;
  if (isError) return <div>{t("campaigns.dashboard.error")}</div>;

  if (!data?.data || data.data.length === 0)
    return <Empty description={t("campaigns.dashboard.empty")} />;
  console.log(data);

  return (
    <div>
      <Card
        title={t("campaigns.dashboard.title")}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/campaigns/create")}
            style={{ borderRadius: 8 }}
          >
            {t("campaigns.dashboard.create")}
          </Button>
        }
      >
        {data.data.map((campaign: any) => (
          <CampaignCard key={campaign._id} data={campaign} />
        ))}
      </Card>
    </div>
  );
};

export default CampaignsDashboard;
