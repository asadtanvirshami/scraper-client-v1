"use client";

import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Table,
  Badge,
  Button,
  Space,
  theme,
} from "antd";
import { EyeOutlined, AimOutlined, LineChartOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";

import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface CampaignDetailsProps {
  campaign: any;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign }) => {
  if (!campaign) return null;
  const router = useRouter();
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const t = (key: string) => formatMessage({ id: key });
  const isFolderCampaign = campaign.campaign_type === "FOLDER";

  const sentCount = Number(campaign?.analytics?.sent || 0);
  const failedCount = Number(campaign?.analytics?.failed || 0);
  const deliveredCount = Number(campaign?.analytics?.delivered ?? sentCount);
  const bouncedCount = Number(campaign?.analytics?.bounced ?? failedCount);
  const totalOutcomes = deliveredCount + bouncedCount;
  const computedDeliveryRate = Number(
    campaign?.delivery_rate ||
      (totalOutcomes > 0 ? (deliveredCount / totalOutcomes) * 100 : 0),
  ).toFixed(2);
  const computedBounceRate = Number(
    campaign?.bounce_rate ||
      (totalOutcomes > 0 ? (bouncedCount / totalOutcomes) * 100 : 0),
  ).toFixed(2);

  /* ===============================
     KPI DATA
  =============================== */

  const kpis = [
    {
      label: t("campaigns.details.bounce_rate"),
      value: `${computedBounceRate}%`,
    },
    {
      label: t("campaigns.details.delivery_rate"),
      value: `${computedDeliveryRate}%`,
    },
    {
      label: t("campaigns.details.open_rate"),
      value: `${campaign.open_rate || 0}%`,
    },
    {
      label: t("campaigns.details.track_opens"),
      value: t("campaigns.details.enabled"),
      isSwitch: true,
    },
  ];

  /* ===============================
     TABLE DATA
  =============================== */
  const dataSource = isFolderCampaign
    ? campaign.target_folders || []
    : campaign.target_leads || [];

  /* ===============================
     TABLE COLUMNS
  =============================== */

  const baseColumns = isFolderCampaign
    ? [
        {
          title: t("campaigns.details.folder_name"),
          dataIndex: "name",
        },
        {
          title: t("campaigns.details.total_leads"),
          dataIndex: "total_leads",
        },
        {
          title: t("campaigns.details.created_at"),
          dataIndex: "createdAt",
        },
      ]
    : [
        {
          title: t("campaigns.details.lead_name"),
          dataIndex: "name",
        },
        {
          title: t("campaigns.details.email"),
          dataIndex: "email",
        },
        {
          title: t("campaigns.details.company"),
          dataIndex: "company",
        },
        {
          title: t("campaigns.details.status"),
          dataIndex: "status",
          render: (status: string) => (
            <Badge
              status={status === "SENT" ? "success" : "processing"}
              text={t(`campaigns.status.${status}`)}
            />
          ),
        },
      ];

  const actionColumn = {
    title: "",
    key: "actions",
    width: 100,
    render: (_: any, record: any) => (
      <Button
        type="text"
        icon={<EyeOutlined />}
        style={{
          borderRadius: 8,
        }}
        onClick={() => {
          if (isFolderCampaign) {
            router.push(`/folders/f/${record._id}`);
          } else {
            router.push(`/leads/${record._id}`);
          }
        }}
      >
        {t("campaigns.details.view")}
      </Button>
    ),
  };
  return (
    <div>
      {/* ===============================
           PERFORMANCE KPIs
      =============================== */}
      <Card
        title={
          <Space>
            <LineChartOutlined style={{ color: "#fa8c16" }} />
            <span>{t("campaigns.details.performance_title")}</span>
          </Space>
        }
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom: 24,
        }}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
          {t("campaigns.details.performance_description")}
        </Text>

        <Row gutter={[24, 24]}>
          {kpis.map((kpi, index) => (
            <Col xs={12} md={6} key={index}>
              <div
                style={{
                  padding: 16,
                  background: token.colorFillAlter,
                  borderRadius: 8,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {kpi.label}
                </Text>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    marginTop: 8,
                  }}
                >
                  {kpi.isSwitch ? (
                    <Tag
                      color="green"
                      style={{ fontSize: 14 }}
                    >
                      {kpi.value}
                    </Tag>
                  ) : (
                    kpi.value
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* ===============================
           TARGET SECTION
      =============================== */}

      <Card
        title={
          <Space>
            <AimOutlined style={{ color: "#eb2f96" }} />
            <span>
              {isFolderCampaign
                ? t("campaigns.details.target_folders")
                : t("campaigns.details.target_leads")}
            </span>
          </Space>
        }
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
          {isFolderCampaign
            ? t("campaigns.details.target_folders_description")
            : t("campaigns.details.target_leads_description")}
        </Text>

        {/* Option 1: Normal Ant Table */}
        <Table
          dataSource={dataSource}
          columns={[...baseColumns, actionColumn]}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowKey={(record: any) => record.id}
          size="large"
          scroll={{ x: 800 }}
        />

        {/* 
        Option 2: If large dataset, use Virtuoso instead:

        <Virtuoso
          style={{ height: 400 }}
          data={dataSource}
          itemContent={(index, item: any) => (
            <div
              style={{
                padding: 16,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              {isFolderCampaign ? (
                <>
                  <strong>{item.name}</strong>
                  <div>Total Leads: {item.total_leads}</div>
                </>
              ) : (
                <>
                  <strong>{item.name}</strong>
                  <div>{item.email}</div>
                </>
              )}
            </div>
          )}
        />
        */}
      </Card>
    </div>
  );
};

export default CampaignDetails;
