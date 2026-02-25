"use client";

import React from "react";
import { Card, Row, Col, Typography, Tag, Table, Badge, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
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
  const t = (key: string) => formatMessage({ id: key });
  const isFolderCampaign = campaign.campaign_type === "FOLDER";

  /* ===============================
     KPI DATA
  =============================== */

  const kpis = [
    {
      label: t("campaigns.details.bounce_rate"),
      value: `${campaign.bounce_rate || 0}%`,
    },
    {
      label: t("campaigns.details.delivery_rate"),
      value: `${campaign.delivery_rate || 0}%`,
    },
    {
      label: t("campaigns.details.open_rate"),
      value: `${campaign.open_rate || 0}%`,
    },
    {
      label: t("campaigns.details.track_opens"),
      value: campaign.track_opens
        ? t("campaigns.details.enabled")
        : t("campaigns.details.disabled"),
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
    <div style={{ marginTop: 24 }}>
      {/* ===============================
           PERFORMANCE KPIs
      =============================== */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          marginBottom: 24,
        }}
      >
        <Title level={4}>{t("campaigns.details.performance_title")}</Title>

        <Row gutter={[24, 24]}>
          {kpis.map((kpi, index) => (
            <Col xs={12} md={6} key={index}>
              <div>
                <Text type="secondary">{kpi.label}</Text>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  {kpi.isSwitch ? (
                    <Tag color={campaign.track_opens ? "green" : "red"}>
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
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <Title level={4}>
          {isFolderCampaign
            ? t("campaigns.details.target_folders")
            : t("campaigns.details.target_leads")}
        </Title>

        {/* Option 1: Normal Ant Table */}
        <Table
          dataSource={dataSource}
          columns={[...baseColumns, actionColumn]}
          pagination={false}
          rowKey={(record: any) => record.id}
          style={{ marginTop: 16 }}
        />

        {/* 
        Option 2: If large dataset, use Virtuoso instead:

        <Virtuoso
          style={{ height: 400 }}
          data={dataSource}
          itemContent={(index, item: any) => (
            <div style={{ padding: 16, borderBottom: "1px solid #f0f0f0" }}>
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
