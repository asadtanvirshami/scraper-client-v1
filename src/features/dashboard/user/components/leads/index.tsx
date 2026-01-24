import React from "react";
import type { ColumnsType } from "antd/es/table";
import { Card, Table, Button, Space, Tag, Typography } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";

import type { Lead } from "@/types";
import type { LeadsWidgetProps } from "../type";

const LeadsWidget: React.FC<LeadsWidgetProps> = ({
  leads = [],
  total = 0,
  onViewAll,
  isLoading = false,
}) => {
  const { Text } = Typography;

  const columns: ColumnsType<Lead> = [
    {
      title: <FormattedMessage id="leads.table.name" defaultMessage="Name" />,
      key: "name",
      render: (_, record) =>
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "-",
    },
    {
      title: <FormattedMessage id="leads.table.email" defaultMessage="Email" />,
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (value: Lead["email"]) => value || "-",
    },
    {
      title: (
        <FormattedMessage id="leads.table.company" defaultMessage="Company" />
      ),
      dataIndex: "company",
      key: "company",
      ellipsis: true,
      render: (value: Lead["company"]) => value || "-",
    },
    {
      title: (
        <FormattedMessage
          id="leads.table.jobTitle"
          defaultMessage="Job Title"
        />
      ),
      dataIndex: "job_title",
      key: "job_title",
      ellipsis: true,
      render: (value: Lead["job_title"]) => value || "-",
    },
    {
      title: (
        <FormattedMessage id="leads.table.status" defaultMessage="Status" />
      ),
      dataIndex: "is_converted",
      key: "status",
      render: (value?: boolean) =>
        value ? (
          <Tag color="green">
            <FormattedMessage
              id="leads.status.converted"
              defaultMessage="Converted"
            />
          </Tag>
        ) : (
          <Tag color="blue">
            <FormattedMessage id="leads.status.new" defaultMessage="New" />
          </Tag>
        ),
    },
    {
      title: (
        <FormattedMessage id="leads.table.createdAt" defaultMessage="Created" />
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date?: string | Date) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
  ];

  return (
    <Card
      title={
        <FormattedMessage
          id="leads.widget.recent_title"
          defaultMessage="Recent Leads"
        />
      }
      extra={
        <Space>
          <Text className="!text-lg !font-semibold">
            <FormattedMessage
              id="leads.widget.total"
              defaultMessage="Total {total}"
              values={{ total }}
            />
          </Text>

          <Button icon={<EyeOutlined />} onClick={onViewAll}>
            <FormattedMessage
              id="leads.actions.view_all"
              defaultMessage="View all"
            />
          </Button>
        </Space>
      }
    >
      <Table<Lead>
        loading={isLoading}
        rowKey={(record) =>
          record._id ||
          record.email ||
          `${record.first_name}-${record.last_name}`
        }
        columns={columns}
        dataSource={leads}
        pagination={false}
        size="large"
        locale={{
          emptyText: (
            <FormattedMessage id="leads.empty" defaultMessage="No leads yet" />
          ),
        }}
      />
    </Card>
  );
};

export default LeadsWidget;
