"use client";

import React, { useState, useCallback } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  theme,
  message,
} from "antd";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  TagIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  DollarCircleOutlined,
  GiftOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
import {
  adminCancelSubscription,
  adminCreatePromoCode,
  adminDeactivatePromoCode,
  adminFetchCharges,
  adminFetchPromoCodes,
  adminFetchSubscriptions,
  adminIssueRefund,
} from "@/api/api_calls/billing";
import type {
  AdminSubscriptionRow,
  CreatePromoCodePayload,
  StripeCharge,
  StripePromoCode,
} from "@/types/api/billing";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatEUR = (cents: number | null | undefined) => {
  if (!cents) return "—";
  return `€${(cents / 100).toFixed(2)}`;
};

const SUB_STATUS_COLOR: Record<string, string> = {
  active: "success",
  trialing: "purple",
  past_due: "warning",
  canceled: "error",
  unpaid: "error",
  paused: "default",
  incomplete: "warning",
  incomplete_expired: "error",
};

// ─── Subscriptions Tab ────────────────────────────────────────────────────────

const SubscriptionsTab: React.FC = () => {
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscriptions", page, search, statusFilter],
    queryFn: () => adminFetchSubscriptions({ page, limit: 20, search: search || undefined, status: statusFilter }),
  });

  const cancelMut = useMutation({
    mutationFn: (userId: string) => adminCancelSubscription(userId),
    onSuccess: () => {
      message.success("Subscription cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
    },
    onError: (err: any) => message.error(err?.response?.data?.message || "Failed to cancel subscription"),
  });

  const columns: ColumnsType<AdminSubscriptionRow> = [
    {
      title: "User",
      key: "user",
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>
            {[row.user_id?.first_name, row.user_id?.last_name].filter(Boolean).join(" ") || "—"}
          </Text>
          <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>{row.user_id?.email}</Text>
        </Space>
      ),
    },
    {
      title: "Plan",
      key: "plan",
      render: (_, row) => (
        <Space size={4}>
          <Text strong>{row.plan_id?.display_name ?? "—"}</Text>
          <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>
            {formatEUR(row.plan_id?.price_cents)}/mo
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={SUB_STATUS_COLOR[status] ?? "default"} style={{ borderRadius: 12, fontWeight: 600 }}>
          {status?.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Period",
      key: "period",
      render: (_, row) => (
        <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
          {row.current_period_start ? format(new Date(row.current_period_start), "MMM d") : "—"}
          {" → "}
          {row.current_period_end ? format(new Date(row.current_period_end), "MMM d, yyyy") : "—"}
        </Text>
      ),
    },
    {
      title: "Stripe ID",
      key: "stripe_id",
      render: (_, row) =>
        row.stripe_subscription_id ? (
          <Tooltip title={row.stripe_subscription_id}>
            <Text style={{ fontSize: 11, color: token.colorTextTertiary, fontFamily: "monospace" }}>
              {row.stripe_subscription_id.slice(0, 14)}…
            </Text>
          </Tooltip>
        ) : (
          <Text style={{ color: token.colorTextQuaternary, fontSize: 12 }}>Trial only</Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) =>
        row.status !== "canceled" ? (
          <Popconfirm
            title="Cancel Subscription"
            description="This will immediately cancel the subscription in Stripe. This cannot be undone."
            onConfirm={() => cancelMut.mutate(String(row.user_id?._id))}
            okText="Cancel Subscription"
            okButtonProps={{ danger: true }}
            cancelText="Keep"
          >
            <Button danger size="small" icon={<StopOutlined />} loading={cancelMut.isPending}>
              Cancel
            </Button>
          </Popconfirm>
        ) : (
          <Tag color="error">Cancelled</Tag>
        ),
    },
  ];

  return (
    <div>
      {/* Filters */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14}>
          <Input.Search
            placeholder="Search by email or name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onSearch={(v) => { setSearch(v); setPage(1); }}
            allowClear
            prefix={<SearchOutlined />}
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col xs={24} sm={10}>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: "100%", borderRadius: 8 }}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: "active", label: "Active" },
              { value: "trialing", label: "Trial" },
              { value: "past_due", label: "Past Due" },
              { value: "canceled", label: "Canceled" },
              { value: "unpaid", label: "Unpaid" },
            ]}
          />
        </Col>
      </Row>

      <Table
        dataSource={data?.data ?? []}
        columns={columns}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          total: data?.pagination?.total ?? 0,
          current: page,
          pageSize: 20,
          onChange: (p) => setPage(p),
          showTotal: (t) => `${t} subscriptions`,
        }}
        scroll={{ x: 800 }}
        style={{ borderRadius: 12 }}
      />
    </div>
  );
};

// ─── Refunds Tab ──────────────────────────────────────────────────────────────

const RefundsTab: React.FC = () => {
  const { token } = theme.useToken();
  const [customerId, setCustomerId] = useState("");
  const [customerInput, setCustomerInput] = useState("");
  const [refundModal, setRefundModal] = useState<StripeCharge | null>(null);
  const [refundForm] = Form.useForm();

  const { data: chargesData, isLoading, refetch } = useQuery({
    queryKey: ["admin-charges", customerId],
    queryFn: () => adminFetchCharges({ customer_id: customerId || undefined, limit: 20 }),
    enabled: true,
  });

  const refundMut = useMutation({
    mutationFn: (payload: { charge_id: string; amount?: number; reason?: string }) =>
      adminIssueRefund(payload),
    onSuccess: () => {
      message.success("Refund issued successfully");
      setRefundModal(null);
      refundForm.resetFields();
      refetch();
    },
    onError: (err: any) => message.error(err?.response?.data?.message || "Refund failed"),
  });

  const handleRefund = async () => {
    const vals = await refundForm.validateFields();
    if (!refundModal) return;
    refundMut.mutate({
      charge_id: refundModal.id,
      amount: vals.amount ? Math.round(vals.amount * 100) : undefined,
      reason: vals.reason,
    });
  };

  const columns: ColumnsType<StripeCharge> = [
    {
      title: "Charge ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <Tooltip title={id}>
          <Text style={{ fontSize: 12, fontFamily: "monospace", color: token.colorTextSecondary }}>
            {id.slice(0, 14)}…
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{formatEUR(row.amount)}</Text>
          {row.amount_refunded > 0 && (
            <Text style={{ fontSize: 11, color: token.colorWarning }}>
              Refunded: {formatEUR(row.amount_refunded)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <Tag color={row.refunded ? "warning" : row.status === "succeeded" ? "success" : "error"}>
          {row.refunded ? "REFUNDED" : row.status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Date",
      key: "created",
      render: (_, row) => (
        <Text style={{ fontSize: 12 }}>{format(new Date(row.created * 1000), "MMM d, yyyy HH:mm")}</Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) =>
        !row.refunded && row.status === "succeeded" ? (
          <Button
            size="small"
            onClick={() => { setRefundModal(row); refundForm.resetFields(); }}
            icon={<DollarCircleOutlined />}
          >
            Refund
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <Alert
        type="warning"
        showIcon
        message="Refunds are permanent and cannot be reversed. Partial refunds will subtract from the charge amount."
        style={{ borderRadius: 10, marginBottom: 16 }}
      />

      {/* Customer filter */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={14}>
          <Input.Search
            placeholder="Search by Stripe Customer ID (cus_…)"
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
            onSearch={(v) => setCustomerId(v.trim())}
            allowClear
            onClear={() => setCustomerId("")}
            prefix={<SearchOutlined />}
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>Refresh</Button>
        </Col>
      </Row>

      <Table
        dataSource={chargesData?.data ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 700 }}
        style={{ borderRadius: 12 }}
      />

      {/* Refund modal */}
      <Modal
        open={!!refundModal}
        title={
          <Space>
            <DollarCircleOutlined style={{ color: token.colorWarning }} />
            Issue Refund
          </Space>
        }
        onCancel={() => setRefundModal(null)}
        footer={[
          <Button key="cancel" onClick={() => setRefundModal(null)}>Cancel</Button>,
          <Button key="refund" danger loading={refundMut.isPending} onClick={handleRefund}>Confirm Refund</Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          <div style={{ padding: 14, borderRadius: 10, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}>
            <Text style={{ color: token.colorTextSecondary }}>Charge ID: </Text>
            <Text strong style={{ fontFamily: "monospace", fontSize: 12 }}>{refundModal?.id}</Text>
            <br />
            <Text style={{ color: token.colorTextSecondary }}>Original amount: </Text>
            <Text strong>{formatEUR(refundModal?.amount)}</Text>
            {(refundModal?.amount_refunded ?? 0) > 0 && (
              <>
                <br />
                <Text style={{ color: token.colorWarning }}>Already refunded: {formatEUR(refundModal?.amount_refunded)}</Text>
              </>
            )}
          </div>
          <Form form={refundForm} layout="vertical">
            <Form.Item
              label="Refund Amount (€) — leave empty for full refund"
              name="amount"
              rules={[
                {
                  validator: (_, v) => {
                    if (!v) return Promise.resolve();
                    const max = ((refundModal?.amount ?? 0) - (refundModal?.amount_refunded ?? 0)) / 100;
                    if (v > max) return Promise.reject(`Max refundable: €${max.toFixed(2)}`);
                    if (v <= 0) return Promise.reject("Amount must be positive");
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber prefix="€" style={{ width: "100%" }} placeholder="Leave empty for full refund" min={0.01} step={0.01} />
            </Form.Item>
            <Form.Item label="Reason" name="reason">
              <Select placeholder="Select a reason (optional)" allowClear options={[
                { value: "duplicate", label: "Duplicate charge" },
                { value: "fraudulent", label: "Fraudulent" },
                { value: "requested_by_customer", label: "Requested by customer" },
              ]} />
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </div>
  );
};

// ─── Promo Codes Tab ──────────────────────────────────────────────────────────

const PromoCodesTab: React.FC = () => {
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [durationValue, setDurationValue] = useState<"once" | "repeating" | "forever">("once");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: () => adminFetchPromoCodes({ limit: 50 }),
  });

  const createMut = useMutation({
    mutationFn: (payload: CreatePromoCodePayload) => adminCreatePromoCode(payload),
    onSuccess: () => {
      message.success("Promotion code created");
      setCreateModal(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: (err: any) => message.error(err?.response?.data?.message || "Failed to create promo code"),
  });

  const deactivateMut = useMutation({
    mutationFn: (promoCodeId: string) => adminDeactivatePromoCode(promoCodeId),
    onSuccess: () => {
      message.success("Promotion code deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
    onError: (err: any) => message.error(err?.response?.data?.message || "Failed to deactivate"),
  });

  const handleCreate = async () => {
    const vals = await form.validateFields();
    const payload: CreatePromoCodePayload = {
      code: vals.code.toUpperCase(),
      duration: vals.duration,
      name: vals.name || vals.code,
    };
    if (discountType === "percent") {
      payload.percent_off = vals.discount_value;
    } else {
      payload.amount_off = Math.round(vals.discount_value * 100);
      payload.currency = "eur";
    }
    if (vals.duration === "repeating") payload.duration_in_months = vals.duration_in_months;
    if (vals.max_redemptions) payload.max_redemptions = vals.max_redemptions;
    if (vals.expires_at) payload.expires_at = vals.expires_at.toISOString();
    createMut.mutate(payload);
  };

  const columns: ColumnsType<StripePromoCode> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string, row) => (
        <Space>
          <Tag style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em" }}>{code}</Tag>
          {!row.active && <Tag color="error">INACTIVE</Tag>}
        </Space>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_, row) => (
        <Text strong style={{ color: token.colorSuccess }}>
          {row.coupon.percent_off ? `${row.coupon.percent_off}% off` : formatEUR(row.coupon.amount_off ?? 0)}
        </Text>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, row) => (
        <Text>
          {row.coupon.duration === "repeating"
            ? `${row.coupon.duration_in_months} months`
            : row.coupon.duration}
        </Text>
      ),
    },
    {
      title: "Redemptions",
      key: "redemptions",
      render: (_, row) => (
        <Text>
          {row.times_redeemed}
          {row.max_redemptions ? ` / ${row.max_redemptions}` : ""}
        </Text>
      ),
    },
    {
      title: "Expires",
      key: "expires",
      render: (_, row) =>
        row.expires_at
          ? format(new Date(row.expires_at * 1000), "MMM d, yyyy")
          : <Text style={{ color: token.colorTextQuaternary }}>Never</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, row) =>
        row.active ? (
          <Popconfirm
            title="Deactivate promo code?"
            description="This code will no longer be usable."
            onConfirm={() => deactivateMut.mutate(row.id)}
            okText="Deactivate"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
          >
            <Button danger size="small" loading={deactivateMut.isPending}>Deactivate</Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: token.colorTextSecondary }}>
          {(data?.data ?? []).filter((p) => p.active).length} active codes
        </Text>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>Refresh</Button>
          <Button type="primary" icon={<GiftOutlined />} onClick={() => setCreateModal(true)} style={{ borderRadius: 8 }}>
            Create Promo Code
          </Button>
        </Space>
      </div>

      <Table
        dataSource={data?.data ?? []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 700 }}
        style={{ borderRadius: 12 }}
      />

      {/* Create promo code modal */}
      <Modal
        open={createModal}
        title={<Space><GiftOutlined style={{ color: token.colorPrimary }} /> Create Promotion Code</Space>}
        onCancel={() => { setCreateModal(false); form.resetFields(); }}
        onOk={handleCreate}
        confirmLoading={createMut.isPending}
        okText="Create"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Promo Code" name="code" rules={[{ required: true, message: "Required" }]}>
                <Input placeholder="SUMMER25" style={{ textTransform: "uppercase" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Internal Name" name="name">
                <Input placeholder="Summer 2025 discount" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Discount Type" required>
                <Select value={discountType} onChange={(v) => setDiscountType(v)} options={[
                  { value: "percent", label: "Percentage (%)" },
                  { value: "amount", label: "Fixed Amount (€)" },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={discountType === "percent" ? "Discount (%)" : "Discount Amount (€)"}
                name="discount_value"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0.01}
                  max={discountType === "percent" ? 100 : undefined}
                  step={discountType === "percent" ? 1 : 0.01}
                  suffix={discountType === "percent" ? "%" : "€"}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Duration" name="duration" initialValue="once" rules={[{ required: true }]}>
                <Select onChange={(v) => setDurationValue(v)} options={[
                  { value: "once", label: "Once" },
                  { value: "repeating", label: "Repeating" },
                  { value: "forever", label: "Forever" },
                ]} />
              </Form.Item>
            </Col>
            {durationValue === "repeating" && (
              <Col span={12}>
                <Form.Item label="Duration (months)" name="duration_in_months" rules={[{ required: true, message: "Required for repeating" }]}>
                  <InputNumber style={{ width: "100%" }} min={1} />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Max Redemptions" name="max_redemptions">
                <InputNumber style={{ width: "100%" }} min={1} placeholder="Unlimited" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Expiry Date" name="expires_at">
                <DatePicker style={{ width: "100%" }} disabledDate={(d) => d && d.valueOf() < Date.now()} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AdminBillingManagement: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, color: token.colorText }}>Billing Management</Title>
        <Text style={{ color: token.colorTextSecondary, marginTop: 4, display: "block" }}>
          Manage subscriptions, issue refunds, and control promotional codes
        </Text>
      </div>

      <Card style={{ borderRadius: 16, border: `1px solid ${token.colorBorderSecondary}` }} bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey="subscriptions"
          style={{ padding: "0 24px" }}
          tabBarStyle={{ marginBottom: 0, paddingTop: 8 }}
          items={[
            {
              key: "subscriptions",
              label: (
                <Space>
                  <TeamOutlined />
                  Subscriptions
                </Space>
              ),
              children: (
                <div style={{ padding: "24px 0" }}>
                  <SubscriptionsTab />
                </div>
              ),
            },
            {
              key: "refunds",
              label: (
                <Space>
                  <DollarCircleOutlined />
                  Refunds
                </Space>
              ),
              children: (
                <div style={{ padding: "24px 0" }}>
                  <RefundsTab />
                </div>
              ),
            },
            {
              key: "promo-codes",
              label: (
                <Space>
                  <GiftOutlined />
                  Promo Codes
                </Space>
              ),
              children: (
                <div style={{ padding: "24px 0" }}>
                  <PromoCodesTab />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AdminBillingManagement;
