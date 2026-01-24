"use client";

import { Button, Card, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useIntl } from "react-intl";

type Lead = {
  key: string;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  sms_number?: string;
  whatsapp_number?: string;
  landline_number?: string;
  company?: string;
  job_title?: string;
  message?: string;
  is_converted: boolean;
  createdAt: string; // ISO
};

const data: Lead[] = [
  {
    key: "1",
    id: "6958f812bf83bcf8bf04e530",
    first_name: "Rao",
    last_name: "Hassan",
    email: "rao.hassan@example.com",
    sms_number: "+923001234567",
    whatsapp_number: "+923001234567",
    landline_number: "04212345678",
    company: "SUDO Technologies",
    job_title: "Software Engineer",
    message: "Interested in your services. Please contact me.",
    is_converted: false,
    createdAt: "2026-01-03T11:05:54.174+00:00",
  },
];

const LeadsCard = () => {
  const intl = useIntl();

  const columns: ColumnsType<Lead> = [
    {
      title: intl.formatMessage({ id: "leads.table.name" }),
      key: "name",
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: intl.formatMessage({ id: "leads.table.email" }),
      dataIndex: "email",
      key: "email",
    },
    {
      title: intl.formatMessage({ id: "leads.table.company" }),
      dataIndex: "company",
      key: "company",
      render: (v) => v || "—",
    },
    {
      title: intl.formatMessage({ id: "leads.table.jobTitle" }),
      dataIndex: "job_title",
      key: "job_title",
      render: (v) => v || "—",
    },
    {
      title: intl.formatMessage({ id: "leads.table.whatsapp" }),
      dataIndex: "whatsapp_number",
      key: "whatsapp_number",
      render: (v) => v || "—",
    },
    {
      title: intl.formatMessage({ id: "leads.table.status" }),
      dataIndex: "is_converted",
      key: "is_converted",
      render: (isConverted) =>
        isConverted ? (
          <Tag color="green">{intl.formatMessage({ id: "leads.status.converted" })}</Tag>
        ) : (
          <Tag color="default">{intl.formatMessage({ id: "leads.status.new" })}</Tag>
        ),
    },
    {
      title: intl.formatMessage({ id: "leads.table.createdAt" }),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (iso) => new Date(iso).toLocaleString(),
    },
    {
      title: intl.formatMessage({ id: "leads.table.actions" }),
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button type="link">{intl.formatMessage({ id: "leads.actions.view" })}</Button>

          <Tooltip title={record.message || ""}>
            <Button type="link" disabled={!record.message}>
              {intl.formatMessage({ id: "leads.actions.message" })}
            </Button>
          </Tooltip>

          {!record.is_converted && (
            <Button type="link">
              {intl.formatMessage({ id: "leads.actions.convert" })}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space size={16} className="w-full">
      <Card
        title={intl.formatMessage({ id: "leads.title" })}
        extra={<Button type="primary">{intl.formatMessage({ id: "leads.create" })}</Button>}
      >
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </Space>
  );
};

export default LeadsCard;
