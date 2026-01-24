"use client";

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useIntl } from "react-intl";

const { Text } = Typography;

type Folder = {
  _id: string;
  name: string;
  user_id: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

const seed: Folder[] = [
  {
    _id: "69590e25c32ecd1e9886e58e",
    name: "mobile",
    user_id: "694ff61186af378591b0cc86",
    is_deleted: true,
    createdAt: "2026-01-03T12:40:05.310+00:00",
    updatedAt: "2026-01-03T12:41:05.984+00:00",
  },
  {
    _id: "69590e25c32ecd1e9886e58f",
    name: "enterprise",
    user_id: "694ff61186af378591b0cc86",
    is_deleted: false,
    createdAt: "2026-01-06T09:20:00.000+00:00",
    updatedAt: "2026-01-07T18:10:00.000+00:00",
  },
];

function fmtLocal(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

const FoldersCard: React.FC = () => {
  const intl = useIntl();

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deleted">("all");

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 8,
    showSizeChanger: true,
    pageSizeOptions: [8, 15, 30, 50],
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Folder | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return seed
      .filter((f) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "deleted") return f.is_deleted;
        return !f.is_deleted;
      })
      .filter((f) => {
        if (!query) return true;
        return (
          f.name.toLowerCase().includes(query) ||
          f._id.toLowerCase().includes(query) ||
          f.user_id.toLowerCase().includes(query)
        );
      });
  }, [q, statusFilter]);

  const openDrawer = (folder: Folder) => {
    setSelected(folder);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<Folder> = [
    {
      title: intl.formatMessage({ id: "folders.table.name" }),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: intl.formatMessage({ id: "folders.table.status" }),
      dataIndex: "is_deleted",
      key: "is_deleted",
      render: (isDeleted) =>
        isDeleted ? (
          <Tag color="red">{intl.formatMessage({ id: "folders.status.deleted" })}</Tag>
        ) : (
          <Tag color="green">{intl.formatMessage({ id: "folders.status.active" })}</Tag>
        ),
      filters: [
        { text: intl.formatMessage({ id: "folders.status.active" }), value: "active" },
        { text: intl.formatMessage({ id: "folders.status.deleted" }), value: "deleted" },
      ],
      onFilter: (value, record) =>
        value === "deleted" ? record.is_deleted : !record.is_deleted,
    },
    {
      title: intl.formatMessage({ id: "folders.table.createdAt" }),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (iso) => fmtLocal(iso),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: intl.formatMessage({ id: "folders.table.updatedAt" }),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (iso) => fmtLocal(iso),
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: intl.formatMessage({ id: "folders.table.actions" }),
      key: "actions",
      render: (_, r) => (
        <Space size="small">
          <Button type="link" onClick={() => openDrawer(r)}>
            {intl.formatMessage({ id: "folders.actions.view" })}
          </Button>

          {!r.is_deleted ? (
            <Button type="link" danger>
              {intl.formatMessage({ id: "folders.actions.delete" })}
            </Button>
          ) : (
            <Button type="link">
              {intl.formatMessage({ id: "folders.actions.restore" })}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={intl.formatMessage({ id: "folders.title" })}
        extra={<Button type="primary">{intl.formatMessage({ id: "folders.create" })}</Button>}
      >
        <Space orientation="vertical" size={12} className="w-full">
          <Space wrap className="w-full" style={{ justifyContent: "space-between" }}>
            <Input.Search
              allowClear
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={intl.formatMessage({ id: "folders.search.placeholder" })}
              style={{ maxWidth: 420 }}
            />

            <Space wrap>
              <Button
                type={statusFilter === "all" ? "primary" : "default"}
                onClick={() => setStatusFilter("all")}
              >
                {intl.formatMessage({ id: "folders.filters.all" })}
              </Button>
              <Button
                type={statusFilter === "active" ? "primary" : "default"}
                onClick={() => setStatusFilter("active")}
              >
                {intl.formatMessage({ id: "folders.status.active" })}
              </Button>
              <Button
                type={statusFilter === "deleted" ? "primary" : "default"}
                onClick={() => setStatusFilter("deleted")}
              >
                {intl.formatMessage({ id: "folders.status.deleted" })}
              </Button>
            </Space>
          </Space>

          <Table
            rowKey={(r) => r._id}
            columns={columns}
            dataSource={filtered}
            pagination={{ ...pagination, total: filtered.length }}
            onChange={(pag) => setPagination(pag)}
          />
        </Space>
      </Card>

      <Drawer
        title={intl.formatMessage({ id: "folders.drawer.title" })}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
      >
        {selected && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={intl.formatMessage({ id: "folders.fields.id" })}>
                {selected._id}
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: "folders.fields.name" })}>
                {selected.name}
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: "folders.fields.userId" })}>
                {selected.user_id}
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: "folders.fields.status" })}>
                {selected.is_deleted ? (
                  <Tag color="red">{intl.formatMessage({ id: "folders.status.deleted" })}</Tag>
                ) : (
                  <Tag color="green">{intl.formatMessage({ id: "folders.status.active" })}</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: "folders.fields.createdAt" })}>
                {fmtLocal(selected.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label={intl.formatMessage({ id: "folders.fields.updatedAt" })}>
                {fmtLocal(selected.updatedAt)}
              </Descriptions.Item>
            </Descriptions>

            <Space style={{ marginTop: 16 }}>
              <Button onClick={() => setDrawerOpen(false)}>
                {intl.formatMessage({ id: "folders.drawer.close" })}
              </Button>

              {!selected.is_deleted ? (
                <Button danger>
                  {intl.formatMessage({ id: "folders.actions.delete" })}
                </Button>
              ) : (
                <Button type="primary">
                  {intl.formatMessage({ id: "folders.actions.restore" })}
                </Button>
              )}
            </Space>
          </>
        )}
      </Drawer>
    </>
  );
};

export default FoldersCard;
