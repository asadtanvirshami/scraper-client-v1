"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  ChromeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  AdminListPoolAccounts,
  AdminAddPoolAccount,
  AdminUpdatePoolCookies,
  AdminDeletePoolAccount,
  AdminResetPoolAccount,
  type PoolAccount,
} from "@/api/api_calls/account-pool";

const { Title, Text, Paragraph, Link } = Typography;
const { TextArea } = Input;

const MAX_ACCOUNTS = 10;

const statusColor: Record<string, string> = {
  active: "green",
  inactive: "default",
  rate_limited: "orange",
  suspended: "red",
  error: "red",
};

// ─── Instructions panel ───────────────────────────────────────────────────────
function SetupInstructions() {
  return (
    <Card
      style={{ marginBottom: 24, borderColor: "#1677ff33" }}
      styles={{ header: { background: "#e6f4ff", borderBottom: "1px solid #1677ff33" } }}
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: "#1677ff" }} />
          <span style={{ color: "#1677ff", fontWeight: 600 }}>
            How to add an Instagram pool account
          </span>
        </Space>
      }
    >
      <Steps
        direction="vertical"
        size="small"
        style={{ marginBottom: 12 }}
        items={[
          {
            title: "Install the cookie extraction extension",
            description: (
              <Text type="secondary">
                Install{" "}
                <Link
                  href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm"
                  target="_blank"
                >
                  Cookie-Editor
                </Link>{" "}
                (or similar) from the Chrome Web Store. It exports cookies as
                JSON.
              </Text>
            ),
            icon: <ChromeOutlined />,
            status: "process",
          },
          {
            title: "Log in to a dedicated Instagram \"burning\" account",
            description: (
              <Text type="secondary">
                Use a throwaway Instagram account — not your personal or client
                accounts. Open Instagram in Chrome and log in fully.
              </Text>
            ),
            icon: <CheckCircleOutlined />,
            status: "process",
          },
          {
            title: "Export the session cookies",
            description: (
              <Text type="secondary">
                Click the Cookie-Editor extension icon → click{" "}
                <Text strong>Export</Text> → choose{" "}
                <Text strong>Export as JSON</Text>. The full cookie array is
                copied to your clipboard.
              </Text>
            ),
            icon: <CheckCircleOutlined />,
            status: "process",
          },
          {
            title: "Paste & save below",
            description: (
              <Text type="secondary">
                Click <Text strong>Add Account</Text>, paste the JSON array into
                the text area, give it a display name, and save. The proxy is
                assigned automatically.
              </Text>
            ),
            icon: <SafetyCertificateOutlined />,
            status: "process",
          },
        ]}
      />
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        message="Important notes"
        description={
          <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
            <li>Up to <strong>10</strong> pool accounts can be added.</li>
            <li>
              Each account is automatically assigned a dedicated proxy port
              (round-robin from the configured proxy pool).
            </li>
            <li>
              Do <strong>not</strong> use your real Instagram account — these
              accounts may get rate-limited or suspended during heavy scraping.
            </li>
            <li>
              Cookies expire when the Instagram session ends. Replace them here
              whenever an account shows <Tag color="red">error</Tag> or{" "}
              <Tag color="orange">rate_limited</Tag>.
            </li>
          </ul>
        }
      />
    </Card>
  );
}

// ─── Add / Update Cookies modal ───────────────────────────────────────────────
function CookieModal({
  open,
  mode,
  account,
  onClose,
  onSuccess,
}: {
  open: boolean;
  mode: "add" | "update";
  account: PoolAccount | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // Validate JSON before sending
      let parsed: unknown;
      try {
        parsed = JSON.parse(values.cookies);
      } catch {
        message.error("Invalid JSON — paste the raw cookie array exported by Cookie-Editor.");
        setSaving(false);
        return;
      }
      if (!Array.isArray(parsed)) {
        message.error("Expected a JSON array of cookies.");
        setSaving(false);
        return;
      }

      if (mode === "add") {
        const res = await AdminAddPoolAccount({
          cookies: values.cookies,
          displayName: values.displayName || undefined,
          notes: values.notes || undefined,
        });
        if (res?.success) {
          message.success("Account added to pool successfully");
          onSuccess();
          onClose();
        } else {
          message.error(res?.message || "Failed to add account");
        }
      } else if (account) {
        const res = await AdminUpdatePoolCookies(account._id, values.cookies);
        if (res?.success) {
          message.success("Cookies updated successfully");
          onSuccess();
          onClose();
        } else {
          message.error(res?.message || "Failed to update cookies");
        }
      }
    } catch {
      // form validation errors handled automatically
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={mode === "add" ? "Add Pool Account" : `Update Cookies — ${account?.displayName}`}
      onCancel={onClose}
      onOk={handleOk}
      okText={mode === "add" ? "Add Account" : "Update Cookies"}
      confirmLoading={saving}
      width={640}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Paste the full JSON array exported from Cookie-Editor extension after logging in to Instagram."
      />
      <Form form={form} layout="vertical">
        {mode === "add" && (
          <>
            <Form.Item
              name="displayName"
              label="Display Name (optional)"
            >
              <Input placeholder="e.g. Burning Account #1" />
            </Form.Item>
            <Form.Item name="notes" label="Notes (optional)">
              <Input placeholder="Any internal note about this account" />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="cookies"
          label="Cookie JSON"
          rules={[{ required: true, message: "Please paste the cookie JSON" }]}
        >
          <TextArea
            rows={10}
            placeholder={`[\n  {"name":"sessionid","value":"123456789:abc","domain":".instagram.com",...},\n  ...\n]`}
            style={{ fontFamily: "monospace", fontSize: 12 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AccountPoolingManager() {
  const [accounts, setAccounts] = useState<PoolAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "update">("add");
  const [selectedAccount, setSelectedAccount] = useState<PoolAccount | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});

  const fetchAccounts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await AdminListPoolAccounts();
      if (res?.success) {
        setAccounts(res.data?.accounts ?? []);
        setTotal(res.data?.total ?? 0);
      }
    } catch {
      if (!silent) message.error("Failed to load pool accounts");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const setAction = (id: string, a: string) =>
    setActionLoading((p) => ({ ...p, [id]: a }));
  const clearAction = (id: string) =>
    setActionLoading((p) => { const n = { ...p }; delete n[id]; return n; });

  const handleDelete = async (id: string) => {
    setAction(id, "delete");
    try {
      const res = await AdminDeletePoolAccount(id);
      if (res?.success) {
        message.success("Account removed from pool");
        await fetchAccounts(true);
      } else {
        message.error(res?.message || "Failed to delete");
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to delete");
    } finally {
      clearAction(id);
    }
  };

  const handleReset = async (id: string) => {
    setAction(id, "reset");
    try {
      const res = await AdminResetPoolAccount(id);
      if (res?.success) {
        message.success("Account reset to active");
        await fetchAccounts(true);
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to reset");
    } finally {
      clearAction(id);
    }
  };

  const openAdd = () => {
    if (total >= MAX_ACCOUNTS) {
      message.warning(`Pool is full (${MAX_ACCOUNTS}/${MAX_ACCOUNTS}). Remove an account first.`);
      return;
    }
    setModalMode("add");
    setSelectedAccount(null);
    setModalOpen(true);
  };

  const openUpdateCookies = (account: PoolAccount) => {
    setModalMode("update");
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const columns: ColumnsType<PoolAccount> = [
    {
      title: "#",
      key: "index",
      width: 42,
      render: (_, __, i) => <Text type="secondary">{i + 1}</Text>,
    },
    {
      title: "Display Name",
      key: "displayName",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.displayName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>@{r.username}</Text>
        </Space>
      ),
    },
    {
      title: "IG User ID",
      dataIndex: "instagramUserId",
      key: "instagramUserId",
      render: (v) => <Text code style={{ fontSize: 11 }}>{v}</Text>,
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      render: (_, r) => (
        <Space>
          <Badge
            status={r.isAvailable ? "processing" : "default"}
            color={r.isAvailable ? "green" : "grey"}
          />
          <Tag color={statusColor[r.status] ?? "default"}>{r.status}</Tag>
        </Space>
      ),
    },
    {
      title: "Proxy",
      key: "proxy",
      render: (_, r) => {
        if (!r.proxyUrl) return <Text type="secondary">—</Text>;
        const match = r.proxyUrl.match(/@(.+)$/);
        const display = match ? match[1] : r.proxyUrl;
        return <Text code style={{ fontSize: 11 }}>{display}</Text>;
      },
    },
    {
      title: "Requests",
      key: "requests",
      width: 90,
      render: (_, r) => (
        <Tooltip title={`${r.successfulRequests} success / ${r.failedRequests} fail`}>
          <Text>{r.totalRequests.toLocaleString()}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Failures",
      key: "failures",
      width: 80,
      render: (_, r) => (
        <Tag color={r.consecutiveFailures > 2 ? "red" : r.consecutiveFailures > 0 ? "orange" : "green"}>
          {r.consecutiveFailures}
        </Tag>
      ),
    },
    {
      title: "Last Used",
      key: "lastUsed",
      width: 110,
      render: (_, r) =>
        r.lastUsedAt
          ? <Text type="secondary" style={{ fontSize: 11 }}>{new Date(r.lastUsedAt).toLocaleDateString()}</Text>
          : <Text type="secondary">Never</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, r) => {
        const busy = actionLoading[r._id];
        return (
          <Space>
            <Tooltip title="Replace cookies">
              <Button
                size="small"
                icon={<SyncOutlined spin={busy === "update"} />}
                onClick={() => openUpdateCookies(r)}
                loading={busy === "update"}
              >
                Cookies
              </Button>
            </Tooltip>
            <Tooltip title="Reset failures & reactivate">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => handleReset(r._id)}
                loading={busy === "reset"}
              />
            </Tooltip>
            <Popconfirm
              title="Remove this account from the pool?"
              onConfirm={() => handleDelete(r._id)}
              okText="Remove"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={busy === "delete"}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const activeCount = accounts.filter((a) => a.status === "active" && a.isAvailable).length;
  const errorCount = accounts.filter((a) => a.status === "error" || a.status === "suspended").length;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>Account Pooling</Title>
          <Text type="secondary">
            Manage Instagram scraping accounts. Each account uses a dedicated proxy port.
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchAccounts()}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAdd}
              disabled={total >= MAX_ACCOUNTS}
            >
              Add Account
            </Button>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      {/* Stats row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <Card size="small" style={{ minWidth: 120, textAlign: "center" }}>
            <Text strong style={{ fontSize: 22 }}>{total}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>/ {MAX_ACCOUNTS} accounts</Text>
          </Card>
        </Col>
        <Col>
          <Card size="small" style={{ minWidth: 120, textAlign: "center", borderColor: "#52c41a44" }}>
            <Text strong style={{ fontSize: 22, color: "#52c41a" }}>{activeCount}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>active</Text>
          </Card>
        </Col>
        {errorCount > 0 && (
          <Col>
            <Card size="small" style={{ minWidth: 120, textAlign: "center", borderColor: "#ff4d4f44" }}>
              <Text strong style={{ fontSize: 22, color: "#ff4d4f" }}>{errorCount}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>need attention</Text>
            </Card>
          </Col>
        )}
      </Row>

      {/* Instructions */}
      <SetupInstructions />

      {/* Accounts table */}
      <Card
        title={
          <Space>
            <Text strong>Pool Accounts</Text>
            <Tag color={total >= MAX_ACCOUNTS ? "red" : "blue"}>
              {total} / {MAX_ACCOUNTS}
            </Tag>
          </Space>
        }
      >
        <Table
          dataSource={accounts}
          columns={columns}
          rowKey="_id"
          loading={loading}
          size="small"
          pagination={false}
          locale={{
            emptyText: (
              <Space direction="vertical" style={{ padding: "24px 0", textAlign: "center" }}>
                <SafetyCertificateOutlined style={{ fontSize: 32, color: "#d9d9d9" }} />
                <Text type="secondary">No pool accounts yet. Click &quot;Add Account&quot; to get started.</Text>
              </Space>
            ),
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Add / Update cookies modal */}
      <CookieModal
        open={modalOpen}
        mode={modalMode}
        account={selectedAccount}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchAccounts(true)}
      />
    </div>
  );
}
