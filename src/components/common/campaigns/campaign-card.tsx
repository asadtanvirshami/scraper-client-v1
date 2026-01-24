"use client";

import { Button, Card, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useIntl } from "react-intl";

type Campaign = {
  key: string;
  name: string;
  status: "Draft" | "Active" | "Paused";
  sent: number;
  openRate: string;
};

const data: Campaign[] = [
  { key: "1", name: "SaaS Outreach – Jan", status: "Active", sent: 1200, openRate: "42%" },
  { key: "2", name: "Follow-up Sequence", status: "Paused", sent: 860, openRate: "38%" },
  { key: "3", name: "Cold Leads v2", status: "Draft", sent: 0, openRate: "-" },
];

const CampaignCard = () => {
  const intl = useIntl();

  const columns: ColumnsType<Campaign> = [
    {
      title: intl.formatMessage({ id: "campaigns.table.campaign" }),
      dataIndex: "name",
      key: "name",
    },
    {
      title: intl.formatMessage({ id: "campaigns.table.status" }),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "Active" ? "green" : status === "Paused" ? "orange" : "default";

        const statusLabel =
          status === "Active"
            ? intl.formatMessage({ id: "campaigns.status.active" })
            : status === "Paused"
            ? intl.formatMessage({ id: "campaigns.status.paused" })
            : intl.formatMessage({ id: "campaigns.status.draft" });

        return <Tag color={color}>{statusLabel}</Tag>;
      },
    },
    {
      title: intl.formatMessage({ id: "campaigns.table.emailsSent" }),
      dataIndex: "sent",
      key: "sent",
    },
    {
      title: intl.formatMessage({ id: "campaigns.table.openRate" }),
      dataIndex: "openRate",
      key: "openRate",
    },
    {
      title: intl.formatMessage({ id: "campaigns.table.actions" }),
      key: "actions",
      render: () => (
        <Button type="link">{intl.formatMessage({ id: "campaigns.actions.view" })}</Button>
      ),
    },
  ];

  return (
    <Space size={16} className="w-full">
      <Card
        title={intl.formatMessage({ id: "campaigns.title" })}
        extra={<Button type="primary">{intl.formatMessage({ id: "campaigns.create" })}</Button>}
      >
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </Space>
  );
};

export default CampaignCard;
